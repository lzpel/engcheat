use std::{fs, path, io};

use anyhow::Result;
use google_cloud_texttospeech_v1::{
	client::TextToSpeech,
	model::{
		synthesis_input::InputSource, AudioConfig, AudioEncoding, SynthesisInput,
		SynthesizeSpeechRequest, VoiceSelectionParams,
	},
};

pub async fn list()->Vec<Vec<String>>{	
	// ADC（Application Default Credentials）で認証。必要なら builder().with_credentials(...) も可
	let client = TextToSpeech::builder().build().await.unwrap();

	// リクエスト送信
	let resp = client.list_voices().send().await.unwrap();

	// 利用可能な音声一覧を表示
	return resp.voices.iter().map(|voice| {
		[voice.name.clone()].iter().chain(voice.language_codes.iter()).map(|s| s.to_string()).collect()
	}).collect();
}
/// text を合成して MP3 を out_path に保存
pub async fn speech_mp3(text: &str, voice_name: &str) -> Result<Vec<u8>> {
	// ADC（Application Default Credentials）で認証。必要なら builder().with_credentials(...) も可
	let client = TextToSpeech::builder().build().await?;

	// 入力（プレーンテキスト。SSMLを使うなら InputSource::Ssml に）
	let input = SynthesisInput::new()
		.set_input_source(InputSource::Text(text.to_string()));

	// ボイス選択（言語と voice 名を指定）
	let voice = VoiceSelectionParams::default()
		.set_language_code(language_code_from_voice(voice_name).unwrap_or("NoLanguageCode"))
		.set_name(voice_name);

	// 出力設定（MP3・速度/ピッチなど任意）
	let audio_config = AudioConfig::default()
		.set_audio_encoding(AudioEncoding::Mp3);
	//	.set_speaking_rate(1.0)   // 0.25〜2.0（0は未設定扱い）
	//	.set_pitch(0.0);		  // -20.0〜20.0

	// リクエスト送信
	let req = SynthesizeSpeechRequest::default()
		.set_input(input)
		.set_voice(voice)
		.set_audio_config(audio_config);

	let resp = client
		.synthesize_speech()
		.with_request(req)
		.send()
		.await?;

	Ok(resp.audio_content.to_vec())
}
pub fn save(path_mp3: &path::Path, bytes: &[u8]) -> io::Result<()> {
	fs::create_dir_all(path_mp3.parent().unwrap())?;
	fs::write(path_mp3, &bytes)?;
	Ok(())
}
pub fn language_code_from_voice(voice: &str) -> Option<&str> {
	let pat = "-";
	if let Some(pos1) = voice.find(pat).map(|v| v+pat.len()) {
		if let Some(pos2)=voice[pos1..].find(pat){
			return Some(&voice[..(pos1+pos2)]);
		}
	}
	return None
}

#[cfg(test)]
mod tests {
	use std::{fs, io::{self, Write as _}, path};
	#[tokio::test]
	async fn list_voices() -> anyhow::Result<()> {
		return Ok(());
		let file = fs::File::create("voice.csv")?;
		let mut writer = io::BufWriter::new(file);
		let result= super::list().await;
		for v in result {
			writeln!(&mut writer, "{}", v.join(" "))?;
		}
		Ok(())
	}
	// 実際に Google Cloud TTS を叩いて MP3 を生成する統合テスト
	// ※ 実行には ADC（Application Default Credentials）の設定が必要です
	#[tokio::test]
	async fn speech_mp3() -> anyhow::Result<()> {
		speech_mp3_voice("en-US-Wavenet-C", "Hello, world! This is a test of Google Cloud Text-to-Speech.").await?;
		speech_mp3_voice("ja-JP-Wavenet-A", "こんにちは、世界！これは Google Cloud Text-to-Speech のテストです。").await?;
		Ok(())
	}
	async fn speech_mp3_voice(voice: &str, text: &str) -> anyhow::Result<()> {
		let bytes=super::speech_mp3(
			text,
			voice,
		).await?;
		assert!(bytes.len() > 1000, "生成された MP3 が小さすぎます");
		super::save(path::Path::new("out").join(voice).with_extension("mp3").as_path(), bytes.as_slice())?;
		Ok(())
	}
	#[test]
	fn language_code_from_voice(){
		assert_eq!(super::language_code_from_voice("es-ES-Chirp3-HD-Laomedeia"), Some("es-ES"));
	}
}