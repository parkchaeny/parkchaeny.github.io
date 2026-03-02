# 박채은 개인 사이트

이 저장소는 GitHub Pages로 배포하는 개인 소개 사이트입니다.

## 수정하기
- `index.html`에서 자기소개 글을 바꿔요.
- `style.css`에서 색깔, 글씨 크기, 배경을 바꿔요.

## GitHub Pages 배포
1. GitHub에 이 저장소를 올려요.
2. 저장소 `Settings` -> `Pages`로 가요.
3. `Build and deployment`에서:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` / `/ (root)`
4. 저장하고 1~2분 기다리면 사이트가 열려요.

사이트 주소 예시: `https://사용자이름.github.io/저장소이름/`

## 댓글 기능(Supabase) 설정
1. Supabase 프로젝트에서 `Authentication -> Providers -> Anonymous`를 켜요.
2. Supabase SQL Editor에서 `supabase_comments_setup.sql` 내용을 실행해요.
3. 1화/2화/3화 페이지는 이미 댓글 기능이 연결되어 있어요:
   - `stories/story-1.html`
   - `stories/story-2.html`
   - `stories/story-3.html`
4. 댓글 클라이언트 코드는 `comments.js`에 있어요.
