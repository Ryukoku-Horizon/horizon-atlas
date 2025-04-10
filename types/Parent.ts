export type Parent={
    annotations:{
        bold:boolean;
        italic:boolean;
        strikethrough:boolean;
        underline:boolean;
        code:boolean;
        color:string;
    };
    plain_text:string;
    href:string | null;
    scroll:string | undefined;
};