"use client"
export type SwitchState = boolean
export type SwitchStateSetter=React.Dispatch<React.SetStateAction<SwitchState>>
export default function Switch(props:{
	children?: React.ReactNode
	value: SwitchState,
	setValue: SwitchStateSetter
}){
	const show=[false,true].map(v=>v==props.value).map(v=>v?"o":"")
	return <button onClick={()=>props.setValue(v=>!v)}>
		{`(${show[0]}---${show[1]})`} {props.children}
	</button>
}