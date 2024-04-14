# Hugo

Hugo is a static site generator written in Go, optimized for speed and designed for flexibility.

## Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Go](https://go.dev/doc/install)
- [Dart Sass](https://gohugo.io/hugo-pipes/transpile-sass-to-css/#dart-sass)

## Installation

Install the [Hugo](https://gohugo.io/installation/) with respect to your Operating System (OS).

## Setup

Follow the instruction below:

1. Create a new project:

    ```bash
    hugo new site hugo-blog
    ```

2. Navigate to Hugo project root:

   ```bash
   cd hugo-blog
   ```

3. Install the `book` theme:

   ```bash
   git submodule add https://github.com/alex-shpak/hugo-book themes/hugo-book
   ```

4. Modify the configuration and add the `book` theme to `hugo.toml`:

    ```toml
    baseURL = 'https://wiki.databurst.tech'
    languageCode = 'en-us'
    title = 'Databurst Data Engineering Wiki'
    theme = "hugo-book"
    ```

5. [optional] Copy the sample content from existing examples:

    ```bash
    cp -R themes/hugo-book/exampleSite/content.en/* ./content
    ```

6. Start the **development** server:

    ```bash
    hugo server
    ```

## Useful Links

- [Book theme documentation](https://themes.gohugo.io/themes/hugo-book/)
