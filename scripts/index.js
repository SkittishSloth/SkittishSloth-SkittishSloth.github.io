const css = hexo.extend.helper.get("css").bind(hexo);

hexo.extend.injector.register(
    "head_end",
    () => {
        return css("/css/main.css");
    }
)