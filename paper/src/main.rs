use clap::Parser;
use std::fs;
use std::path::PathBuf;

// Typst関連のクレートをインポート
// World トレイトを実装することで、Typstコンパイラにソースやフォントを供給する
use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime};
use typst::layout::PagedDocument;
use typst::syntax::{FileId, Source, VirtualPath};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt, World};

/// コマンドライン引数の定義
#[derive(Parser)]
struct Args {
    /// データディレクトリのパス（各サブディレクトリにout.jsonが入っている）
    #[arg(long)]
    data: PathBuf,
    /// 出力PDFのパス
    #[arg(long)]
    out: PathBuf,
}

/// 記事のデータ型: セクション > 文ペア > [英語, 日本語]
type Article = Vec<Vec<[String; 2]>>;

/// フォントデータをバイナリとしてコンパイル時に埋め込む
/// これにより実行時にフォントファイルを別途配置する必要がなくなる
static NOTO_REGULAR: &[u8] = include_bytes!("../fonts/NotoSansJP-Regular.ttf");
static NOTO_BOLD: &[u8] = include_bytes!("../fonts/NotoSansJP-Bold.ttf");

/// Typstの「World」トレイトを実装する構造体
/// Typstコンパイラは World を通じてソースコード・フォント・ファイルにアクセスする
/// LaTeX でいう texmf ツリーのような役割
struct TypstWorld {
    /// Typst標準ライブラリ（組み込み関数や型の定義）
    library: LazyHash<Library>,
    /// フォントのメタデータ一覧（どのフォントが利用可能かをコンパイラに伝える）
    book: LazyHash<FontBook>,
    /// 実際のフォントオブジェクト（グリフデータを含む）
    fonts: Vec<Font>,
    /// コンパイル対象のTypstソースコード
    source: Source,
}

impl TypstWorld {
    /// マークアップ文字列からWorldを構築する
    fn new(markup: String) -> Self {
        // 埋め込みフォントデータからFontオブジェクトを生成
        // Font::iter はフォントコレクション（.ttc）にも対応しており、
        // 単一の .ttf なら1つだけ返す
        let fonts: Vec<Font> = [NOTO_REGULAR, NOTO_BOLD]
            .iter()
            .flat_map(|data| {
                let bytes = Bytes::new(*data);
                Font::iter(bytes)
            })
            .collect();

        // FontBook はフォントのメタデータ索引
        // コンパイラがフォント選択（太字・イタリック等）を行う際に参照する
        let book = LazyHash::new(FontBook::from_fonts(&fonts));

        // メインソースファイルを仮想パス /main.typ として登録
        // Typstは仮想ファイルシステム上で動作するため、実ファイルは不要
        let source = Source::new(
            FileId::new(None, VirtualPath::new("/main.typ")),
            markup,
        );

        Self {
            library: LazyHash::new(Library::default()),
            book,
            fonts,
            source,
        }
    }
}

/// World トレイトの実装
/// Typstコンパイラはこのインターフェースを通じて全てのリソースにアクセスする
impl World for TypstWorld {
    /// Typst標準ライブラリへの参照を返す
    fn library(&self) -> &LazyHash<Library> {
        &self.library
    }

    /// フォントメタデータの索引を返す
    fn book(&self) -> &LazyHash<FontBook> {
        &self.book
    }

    /// メインソースファイルのIDを返す（コンパイルのエントリーポイント）
    fn main(&self) -> FileId {
        self.source.id()
    }

    /// ファイルIDからソースコードを返す
    /// 今回はメインファイル1つだけなので、それ以外はエラーにする
    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.source.id() {
            Ok(self.source.clone())
        } else {
            Err(FileError::NotFound(id.vpath().as_rootless_path().into()))
        }
    }

    /// ファイルIDから生バイトデータを返す（画像やデータファイル用）
    /// 今回は外部ファイルを使わないので常にエラー
    fn file(&self, id: FileId) -> FileResult<Bytes> {
        Err(FileError::NotFound(id.vpath().as_rootless_path().into()))
    }

    /// インデックスからフォントオブジェクトを返す
    /// FontBook の順序と一致している必要がある
    fn font(&self, index: usize) -> Option<Font> {
        self.fonts.get(index).cloned()
    }

    /// 現在の日付を返す（Typstマークアップ中で #datetime.today() を使う場合用）
    fn today(&self, _offset: Option<i64>) -> Option<Datetime> {
        None
    }
}

/// Typstマークアップ文字列をPDFバイト列にコンパイルする
fn compile_to_pdf(markup: &str) -> Vec<u8> {
    let world = TypstWorld::new(markup.to_string());

    // Typstコンパイラを実行し、ページ分割済みドキュメントを生成
    // compile::<PagedDocument> はLaTeXでいう .dvi/.xdv に相当する中間表現を作る
    let warned = typst::compile::<PagedDocument>(&world);
    let document = warned.output.expect("typst compilation failed");

    // 中間表現からPDFバイト列を生成（LaTeXでいう dvipdfmx に相当）
    typst_pdf::pdf(&document, &typst_pdf::PdfOptions::default())
        .expect("pdf export failed")
}

/// Typstマークアップ中で特殊文字をエスケープする
/// Typstでは #, @, $, /, *, _ 等が特別な意味を持つため、
/// ユーザーテキストをそのまま埋め込むとコンパイルエラーになる
fn escape_typst(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            // バックスラッシュでエスケープが必要な文字
            '#' | '@' | '$' | '\\' | '*' | '_' | '~' | '<' | '>' | '[' | ']' => {
                out.push('\\');
                out.push(ch);
            }
            _ => out.push(ch),
        }
    }
    out
}

fn main() {
    let args = Args::parse();

    // データディレクトリ内のサブディレクトリを収集してソート
    // 各サブディレクトリは YYYYMMDD_タイトル の命名規則
    let mut dirs: Vec<_> = fs::read_dir(&args.data)
        .expect("failed to read data directory")
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();
    dirs.sort_by_key(|e| e.file_name());

    // Typstマークアップの組み立て開始
    // ページ設定・フォント設定をプリアンブルとして記述
    let mut markup = String::new();

    // ページマージンとフォントの基本設定
    // Typstではset ruleで文書全体のスタイルを宣言的に設定できる
    markup.push_str(r#"#set page(margin: (top: 12mm, bottom: 12mm, left: 15mm, right: 15mm))
#set text(font: "Noto Sans JP", size: 9pt)
#set par(leading: 0.5em)
"#);

    let mut page_count = 0;

    for dir in &dirs {
        let json_path = dir.path().join("out.json");
        if !json_path.exists() {
            continue;
        }

        // JSONファイルを読み込み、記事データとしてパース
        let json_str = fs::read_to_string(&json_path).expect("failed to read json");
        let article: Article = serde_json::from_str(&json_str).expect("failed to parse json");

        // 2ページ目以降は改ページを挿入
        if page_count > 0 {
            markup.push_str("#pagebreak()\n");
        }
        page_count += 1;

        // ディレクトリ名から日付を抽出（YYYYMMDD → YYYY/MM/DD）
        let dir_name = dir.file_name();
        let dir_name = dir_name.to_string_lossy();
        let date_part = dir_name.splitn(2, '_').next().unwrap_or("");
        let display_date = if date_part.len() == 8 {
            format!(
                "{}/{}/{}",
                &date_part[0..4],
                &date_part[4..6],
                &date_part[6..8]
            )
        } else {
            date_part.to_string()
        };

        // 日付を小さめのテキストで表示
        markup.push_str(&format!(
            "#text(size: 8pt)[{}]\n\n",
            escape_typst(&display_date)
        ));

        // 最初のセクションからタイトルと本文を取得
        if let Some(first_section) = article.first() {
            if let Some(first_pair) = first_section.first() {
                // タイトル（英語＋日本語）を太字・大きめサイズで表示
                markup.push_str(&format!(
                    "#text(size: 14pt, weight: \"bold\")[{}]\n\n",
                    escape_typst(&first_pair[0])
                ));
                markup.push_str(&format!(
                    "#text(size: 14pt, weight: \"bold\")[{}]\n\n",
                    escape_typst(&first_pair[1])
                ));

                // 本文の各文ペア（タイトルの次から）
                // 英語文を通常サイズ、日本語訳を小さめ・グレーで表示
                for pair in first_section.iter().skip(1) {
                    // 英文
                    markup.push_str(&format!(
                        "{}\n",
                        escape_typst(&pair[0])
                    ));
                    // 和訳（やや小さく、色を変えて区別しやすくする）
                    markup.push_str(&format!(
                        "#text(size: 8pt, fill: rgb(\"#444444\"))[{}]\n\n",
                        escape_typst(&pair[1])
                    ));
                }
            }
        }
    }

    // ページ番号をフッターに自動で付与
    // Typstのset ruleは文書のどこに書いても後方に適用されるが、
    // ここではプリアンブルに追記する形で設定
    // （実際にはマークアップの先頭に入れるのが自然だが、
    //   組み立て済みなのでここで先頭に挿入する）
    let header = format!(
        "#set page(footer: context align(center, counter(page).display()))\n"
    );
    markup.insert_str(0, &header);

    // Typstコンパイラでマークアップ → PDFに変換
    let pdf_bytes = compile_to_pdf(&markup);

    // 出力先の親ディレクトリが存在しなければ作成
    if let Some(parent) = args.out.parent() {
        fs::create_dir_all(parent).expect("failed to create output directory");
    }
    fs::write(&args.out, &pdf_bytes).expect("failed to write output file");
    println!("Generated {} pages -> {}", page_count, args.out.display());
}
