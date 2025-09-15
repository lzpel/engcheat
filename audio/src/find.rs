use std::{path};
use walkdir::WalkDir;

pub fn find(path: impl AsRef<path::Path>) -> walkdir::Result<Vec<path::PathBuf>> {
	// 再帰的に走査。エラー（権限など）は無視して続行。
	WalkDir::new(path)
		.follow_links(false) // シンボリックリンクは辿らない（循環回避）
		.into_iter()
		.filter_map(|entry| match entry {
			Ok(e) if e.file_type().is_file() => {
				println!("{}", e.path().display());
				Some(Ok(e.path().to_path_buf()))
			}
			Ok(_) => {
				None
			}		   // ディレクトリ等は無視
			Err(err) => {
				Some(Err(err))
			},
		}).collect()
}
#[cfg(test)]
mod tests {
	#[test]
	fn find() {
		super::find("../out").unwrap();
	}
}