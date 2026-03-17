import { usePageLink } from "@/hooks/usePagePush";
import { assignCss } from "@/lib/assignCssProperties";
import { RenderTextWithBreaksForPlain } from "../renderTextWithBreaks";
import { AtlRichTextEntity } from "@/types/pageData";

type Props = {
  parent: AtlRichTextEntity[];
};

export default function PlainTextCode(props: Props) {
  const { parent } = props;
  const { handleClick } = usePageLink();

  return (
    <pre
      className="
        overflow-x-auto
        text-sm
        font-mono
        leading-relaxed
        rounded-b-lg
        m-0
      "
      style={{
        backgroundColor: "rgb(250,250,250)",
        padding: "0.5rem",
        maxWidth: "100%",
        whiteSpace: "pre", 
      }}
    >
      {parent.map((p, i) => {
        const style = assignCss(p);
        return (
          <span key={i}>
            {RenderTextWithBreaksForPlain(
              p.plain_text,
              style,
              () => handleClick(p.href, p.scroll, p.is_same_bp)
            )}
          </span>
        );
      })}
    </pre>
  );
}

