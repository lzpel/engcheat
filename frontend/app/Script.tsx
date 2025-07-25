type SentencePair=[string,string]
export default function Script(props: {
	fontSize: number
	json: [string,string][][]
}) {
	// すべての文章ペアを平坦化
	const sentencePairs: SentencePair[] = props.json[0];
	return <div style={{fontSize: `${props.fontSize}px`}}>
		<OneThirdHeightDiv/>
		{sentencePairs.map(([en, ja], index) => (
		<div key={index}>
			<div><strong>EN:</strong> {en}</div>
			<div><strong>JP:</strong> {ja}</div>
		</div>
		))}
		<OneThirdHeightDiv/>
	</div>
}
function OneThirdHeightDiv() {
  return (
    <div style={{ height: '33.333vh', backgroundColor: '#f0f0f0' }}></div>
  );
}