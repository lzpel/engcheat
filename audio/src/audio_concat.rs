use std::{collections::{HashMap, HashSet}};

use anyhow::Ok;
type Result<T> = anyhow::Result<T>;
pub async fn concat_mp3<T, F, Fut>(list: Vec<Vec<T>>, generator: F) -> Result<Vec<Vec<u8>>>
where
	F: Fn(T) -> Fut,
	Fut: Future<Output = Result<Vec<u8>>>,
	T: Eq + std::hash::Hash + Clone,
{
	let uniq: HashSet<T>=list.iter().flat_map(|v| v.iter().cloned()).collect();
	// 並列で生成
	let vec: Vec<(T, Vec<u8>)>  = futures::future::try_join_all(uniq.iter().map(|s| {
		let f = generator(s.clone());
		async { f.await.map(|v| (s.clone(), v) ) }
	})).await?;
	let map: HashMap<T, Vec<u8>> = vec.into_iter().collect();
	// 元の順番に戻す
	let joined:Vec<Vec<u8>>=list.iter().map(|v| {
		v.iter().map(|s| map.get(s).cloned().unwrap_or_default()).flatten().collect()
	}).collect();
	return Ok(joined);
}
#[cfg(test)]
mod tests {
	use crate::speech;
	#[tokio::test]
	async fn concat_mp3() {
		let v = super::concat_mp3(
			vec![
				vec!["こんにちは".to_string(),"世界".to_string()], 
				vec!["こんにちは".to_string(),"英語".to_string()]
			], 
			 |s| async move {
				speech::speech_mp3(&s, "ja-JP-Wavenet-B").await
			}
		).await.unwrap();
		speech::save(std::path::Path::new("out/concat1.mp3"), &v[0]).unwrap();
		speech::save(std::path::Path::new("out/concat2.mp3"), &v[1]).unwrap();
	}
}