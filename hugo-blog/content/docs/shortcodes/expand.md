# Expand

Expand shortcode can help to decrease clutter on screen by hiding part of text. Expand content by clicking on it.

## Example
### Default

```tpl
{{</* details */>}}
## Markdown content
Lorem markdownum insigne...
{{</* /details */>}}
```

{{< details >}}
## Markdown content
Lorem markdownum insigne...
{{< /details >}}

### With Custom Label

```tpl
{{</* details "Custom Label" "..." */>}}
## Markdown content
Lorem markdownum insigne...
{{</* /details */>}}
```

{{< details "Custom Label" "..." >}}
## Markdown content
Lorem markdownum insigne. Olympo signis Delphis! Retexi Nereius nova develat
stringit, frustra Saturnius uteroque inter! Oculis non ritibus Telethusa
protulit, sed sed aere valvis inhaesuro Pallas animam: qui _quid_, ignes.
Miseratus fonte Ditis conubia.
{{< /details >}}
