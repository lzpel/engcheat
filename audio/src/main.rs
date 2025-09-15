use std::{path, thread, time};

use crate::{audio_concat::concat_mp3};

mod find;
mod script;
mod speech;
mod audio_concat;
#[tokio::main]
async fn main() {
	let path_all=find::find("../out").expect("find failed");
	let path_json:Vec<path::PathBuf>=path_all.clone().into_iter().filter(|p| p.extension().is_some_and(|s| s=="json")).collect();
	for i in &path_json{
		println!("{}", i.display());
	}
	for i in &path_json{
		println!("Process {}", i.display());
		let script=script::parse_json_to_script(&i).expect("parse failed");
		let p:Vec<(&str, &str)>=script.iter().map(|p| 
			[
				("ja-JP-Wavenet-A", p.jp.as_str()),
				("en-US-Wavenet-C", p.en.as_str())
			]).flatten().collect();
		for _ in 0..3{
			let o=concat_mp3(
				vec![p.clone()],
				|(voice, text)| async move {
					speech::speech_mp3(text, voice).await
				}
			).await.map(|v| v[0].clone());
			match o{
				Ok(v)=>{
					speech::save(i.with_file_name("phrase.mp3").as_path(), v.as_slice()).expect("save failed");
					break;
				},
				Err(e)=>{
					let v=60;
					eprintln!("{e}\nRetry after {v} seconds");
    				thread::sleep(time::Duration::from_secs(v));
				}
			}
		
		}
	}
}
