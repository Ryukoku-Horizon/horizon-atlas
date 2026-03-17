export function RenderTextWithBreaksForPlain(
  text: string,
  style: React.CSSProperties,
  onClick?: () => void
) {
  const t = text.replace(/\t/g, "  ");
  return (
    <span
      style={{
        ...style,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
        whiteSpace: "pre", 
      }}
      onClick={onClick}
    >
      {t}
    </span>
  );
}


export function RenderTextWithBreaks(text: string, style: React.CSSProperties, onClick?: () => void) {
  try{
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = [...text.matchAll(/\n/g)];
    // const wrapStyle: React.CSSProperties = {
    //   ...style,
    //   overflowWrap: 'anywhere', // 長いURLなども強制的に折り返す
    //   wordBreak: 'break-word',
    //   whiteSpace: 'pre-wrap',   // スペースや改行を維持しつつ、端で折り返す
    // };
  
    matches.forEach((match, i) => {
      const index = match.index!;
      elements.push(
        <span key={`line-${i}`} style={style} onClick={onClick}>
          {text.slice(lastIndex, index)}
        </span>
      );
      elements.push(<br key={`br-${i}`} />);
      lastIndex = index + 1;
    });
  
    // 残りのテキストを追加
    if (lastIndex < text.length) {
      elements.push(
        <span key={`line-final`} style={{...style}} onClick={onClick}>
          {text.slice(lastIndex)}
        </span>
      );
    }
  
    return elements;
  }catch(e){
    throw new Error(`error in renderTextWithBreaks: ${e}`)
  }
}