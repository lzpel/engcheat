use async_openai::{
    types::{CreateImageRequestArgs, ImageResponseFormat, ImageSize, ChatCompletionRequestMessage, CreateChatCompletionRequestArgs, ResponseFormat, ResponseFormatJsonSchema},
    Client,
};
use std::{env, error::Error};
use serde_json;

async fn create_image() -> Result<(), Box<dyn Error>> {
    let client = Client::new();
    let request = CreateImageRequestArgs::default()
        .prompt("海上都市の建設現場")
        .n(2)
        .response_format(ImageResponseFormat::Url)
        .size(ImageSize::S256x256)
        .user("async-openai")
        .build()?;

    let response = client.images().create(request).await?;

    // Download and save images to ./data directory.
    // Each url is downloaded and saved in dedicated Tokio task.
    // Directory is created if it doesn't exist.
    let paths = response.save("./data").await?;

    paths
        .iter()
        .for_each(|path| println!("Image file path: {}", path.display()));

    Ok(())
}
async fn create_chat() -> Result<(), Box<dyn Error>> {
    let client = Client::new();
    let request= CreateChatCompletionRequestArgs::default()
        .model("gpt-3.5-turbo")
        .messages([
            ChatCompletionRequestMessage::User("100以下の素数を教えて".into()),
            ChatCompletionRequestMessage::System("貴方はジョークをいう人です".into()),
        ].to_vec())
        .n(2)
        .user("async-openai")
        .build()?;
    let response = client.chat().create(request).await?;
    let out: Vec<String> = response.choices.iter().map(|v| {
        let v=v.clone();
        let i=v.index;
        let t=v.message.content.unwrap_or_default();
        format!("{i}:{t}")
    }).collect();
    println!("{}", out.join("\n"));
    Ok(())
}
#[derive(schemars::JsonSchema)]
struct Step{
    explanation: String,
    output: String,
}
#[derive(schemars::JsonSchema)]
struct MathReasoning{
    steps: Vec<Step>,
    final_answer: String
}
#[derive(Debug, Clone)]
pub struct MyVisitor;
impl schemars::visit::Visitor for MyVisitor {
    fn visit_schema_object(&mut self, schema: &mut schemars::schema::SchemaObject) {
        if let Some(obj) = &mut schema.object {
            obj.additional_properties=Some(Box::from(schemars::schema::Schema::from(false)));
        }
        //schemars::visit::visit_schema_object(self, schema); //再起処理を行わなくてもサブ構造体まで反映された。なぜか知らないが結果出しているので良し。
    }
}
async fn create_json() -> Result<(), Box<dyn Error>> {
    //https://github.com/spiceai/spiceai/blob/c9c314667f87a1e414a06fa5070bc4f5fe9cec1f/crates/llms/src/chat/nsql/structured_output.rs#L20
    //https://platform.openai.com/docs/guides/structured-outputs
    //Structured Outputs is available in two forms in the OpenAI API:
    //
    // When using function calling
    // When using a json_schema response format
    let client = Client::new();
    let structured_output_schema = {
        let settings = schemars::gen::SchemaSettings::draft07().with(|s| {
            s.option_add_null_type = false;
            s.meta_schema = None;
            s.inline_subschemas = false;
            s.visitors.push(Box::new(MyVisitor{}))
        });
        let generator = settings.into_generator();
        let schema = generator.into_root_schema_for::<MathReasoning>();
        serde_json::to_value(schema)?
    };
    println!("{}", serde_json::to_string_pretty(&structured_output_schema)?);
    let request= CreateChatCompletionRequestArgs::default()
        .model("gpt-4o-mini")
        .messages([
            ChatCompletionRequestMessage::System("You are a helpful math tutor. Guide the user through the solution step by step.".into()),
            ChatCompletionRequestMessage::User("how can I solve 8x + 7 = -23".into()),
        ].to_vec())
        .response_format(ResponseFormat::JsonSchema {
            json_schema: ResponseFormatJsonSchema {
                description: None,
                name: "math_reasoning".into(),
                schema: Some(structured_output_schema),
                strict: Some(true),
            },
        })
        .user("async-openai")
        .build()?;
    let response = client.chat().create(request).await?;
    let out: Vec<String> = response.choices.iter().map(|v| {
        let v=v.clone();
        let i=v.index;
        let t=v.message.content.unwrap_or_default();
        format!("{i}:{t}")
    }).collect();
    println!("{}", out.join("\n"));
    Ok(())
}
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // create client, reads OPENAI_API_KEY environment variable for API key.
    env::set_var("OPENAI_API_KEY", "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");
    //create_image().await?;
    create_json().await?;
    Ok(())
}
