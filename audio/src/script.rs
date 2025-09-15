use std::{fs, io, path};
pub struct Phrase{
	pub jp: String,
	pub en: String,
}
pub type Script=Vec<Phrase>;
pub type RawScript=Vec<Vec<Vec<String>>>;
/// JSON文字列をVec<Vec<String>>に変換します。
pub fn parse_json_to_script(path_json: impl AsRef<path::Path>) -> io::Result<Script> {
	// ファイルを開く
	let file = fs::File::open(path_json)?;
	// serde_json::from_strを使ってJSONをRustの型にデシリアライズします。
	// json構造が[ [ ["..."], ["..."] ], [ ["..."], ["..."] ] ]のようになっているため、
	// Vec<Vec<Vec<String>>>としてデシリアライズし、その後でVec<Vec<String>>に変換します。
	let raw_script: RawScript = serde_json::from_reader(io::BufReader::new(&file))?;
	let script: Script=raw_script[0].iter().map(|v|{
		return Phrase{
			jp: v[1].clone(),
			en: v[0].clone(),
		}
	}).collect();
	
	Ok(script)
}
pub fn print_script(script: &Script) {
	for phrase in script {
		println!("JP: {}", phrase.jp);
		println!("EN: {}", phrase.en);
	}
}
#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn parse_json_to_script() {
		let v=super::parse_json_to_script("../fetch/20240424_shopping-when-were-hungry-may-cost-us-more/out.json").unwrap();
		print_script(&v);
	}
}	