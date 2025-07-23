import Image from "next/image";

export default function Home() {
	return <audio controls>
		<source src={`${process.env.NEXT_PUBLIC_PREFIX}/out/20240424_shopping-when-were-hungry-may-cost-us-more/out.mp3`} type="audio/mpeg"/>
		This browser do not support audio element
	</audio>;
}
