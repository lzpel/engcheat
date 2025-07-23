type SentencePair=[string,string]
export default function Script(props: {
	json: [string,string][][]
}) {
	// すべての文章ペアを平坦化
	const sentencePairs: SentencePair[] = props.json.flat();
	return <div>
		{sentencePairs.map(([en, ja], index) => (
		<div key={index}>
			<div><strong>EN:</strong> {en}</div>
			<div><strong>JP:</strong> {ja}</div>
		</div>
		))}
	</div>
}