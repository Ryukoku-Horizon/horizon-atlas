export function renderTextWithBreaks(text: string, style: React.CSSProperties, onClick?: () => void) {
  try{
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = [...text.matchAll(/\n/g)];
    const wrapStyle: React.CSSProperties = {
      ...style,
      overflowWrap: 'anywhere', // 長いURLなども強制的に折り返す
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',   // スペースや改行を維持しつつ、端で折り返す
    };
  
    matches.forEach((match, i) => {
      const index = match.index!;
      elements.push(
        <span key={`line-${i}`} style={wrapStyle} onClick={onClick}>
          {text.slice(lastIndex, index)}
        </span>
      );
      elements.push(<br key={`br-${i}`} />);
      lastIndex = index + 1;
    });
  
    // 残りのテキストを追加
    if (lastIndex < text.length) {
      elements.push(
        <span key={`line-final`} style={{...wrapStyle}} onClick={onClick}>
          {text.slice(lastIndex)}
        </span>
      );
    }
  
    return elements;
  }catch(e){
    throw new Error(`error in renderTextWithBreaks: ${e}`)
  }
}