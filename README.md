# fy_lyrics
lyrics scraper for foobar2000 using JScript Panel. 푸바 사용자로서, 얼마 전 알송 가사 가져오는 게 막힌 이후로 한국 가사 가져오는 게 어려워져서 만들었음.

## 경고!
아직 너무나 초기 버전... 지속적으로 개발 중.

## 기능
1. 푸바의 [JScript Panel](https://marc2k3.github.io/foo_jscript_panel.html)을 이용해 자바스크립트를 실행하여 
2. 국내외 주요 사이트에서 가사를 검색하고 
3. 검색 결과 첫 번째 페이지에서 가사를 스크레이핑해서 
4. 지정한 폴더에 `txt`로 저장한다.
5. 가사를 저장하는 게 끝이므로 푸바의 사실상 표준 가사 플러그인 [Lyric Show 3](https://www.foobar2000.org/components/view/foo_uie_lyrics3)와 함께 사용하자.

## 지원하는 사이트 및 부가 설명
`fy_settings.js` 참고.
1. [Genius](https://genius.com)  //검색이 막혀 있어 아티스트와 타이틀로 URL을 추측하므로 완벽하지 않다.
2. [LyricWiki](https://lyrics.fandom.com)
3. ~~[AZlyrics](https://search.azlyrics.com)~~  //구현은 했으나 품질이 별로라 비활성화
4. [Musixmatch](https://www.musixmatch.com)
5. [LyricsMode](https://www.lyricsmode.com)
6. ~~[SongMeanings](https://songmeanings.com)~~  //좋아하는 사이트지만 워낙 속도가 느려서 비활성화해둠.
7. [지니](https://www.genie.co.kr)
8. [벅스](https://music.bugs.co.kr)  //외국 곡은 검색 결과가 매우 후지게 나옴...
9. ~~[지음아이](http://jieumai.com)~~  //오래됐고 '계속 검색'으로 검색 결과를 계속 찾아야 하므로 구현하려다 말았다.
10. [가사집](https://gasazip.com)

## 설치
1. JScript Panel이 없다면 먼저 설치하고, 패널을 UI에 추가한다.
2. 푸바 폴더(`foobar2000`) 아래 JScript 폴더(`user-components\foo_jscript_panel`)에 가서 
3. `fy_lyrics` 폴더를 만들고 거기에 이곳의 `fy_lyrics.txt.js`, `fy_settings.js`, `lib\unorm.js` 파일을 받아서 둔다.
4. JScript 패널을 우클릭하고 `Configure... > File > Import...` 선택 후 앞의 `fy_lyrics.txt.js` 파일을 선택하고 `[OK]` 버튼을 누른다.
5. 노래를 새로 재생하면 작동 시작.

## `fy_settings.js` 설정
1. 이 파일에서 파일 저장 위치를 지정해야 한다(현재 기본값은 `Z:\lyrics`).
2. Lyric Show 3에서 가사를 저장하는 폴더와 같은 폴더를 쓰자. 그러려고 만들었다...
3. 물론 사이트를 추가할 수도 있고, 원치 않는 사이트는 삭제할 수도 있다.
4. 각 설정 문서화는 나중에.

## 서드파티 라이선스
지니어스 URL은 가령 악샌트를 모두 제거하는데, ES6 기능을 쓸 수가 없어 [unorm](https://github.com/walling/unorm) 폴리필을 썼고, MIT와 GPL 이중 라이선스다.

## 버전 히스토리
- 0.1. 19-12-24, 일단 공개
- 0.2. 19-12-27, 개행문자 사라지는 문제 해결 등등.
- 0.3. 19-12-30, seperates settings, noUseIfHangul setting added, some setting changed, Gasazip added, setting and code refactoring
- 0.4. 19-12-31, setting and code refactoring

## todo
1. ~~개행문자 사라지는 문제 해결. 근데 이건 오래된 js 엔진의 문제라 어째 불가능할 듯.~~
2. 설정 문서화
3. 지니어스 API 사용?
4. 지니어스에서 한국 곡을 더 잘 찾을 방법?
5. 지니어스에서 한글 외 문자 사용?
6. 자동 업데이트. 이건 그리 어렵지 않을 듯.
