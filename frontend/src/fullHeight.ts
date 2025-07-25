import React from "react"

const fullHeight: React.CSSProperties = { height: "100vh", margin: 0, padding: 0 }
const fullHeightFlex: React.CSSProperties = {display: "flex", flexDirection: "column", ...fullHeight}
const InnerScroll: React.CSSProperties = {flex: 1, overflowY: 'auto'}

export {fullHeightFlex, InnerScroll}
export default fullHeight