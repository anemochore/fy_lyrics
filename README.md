# fy_lyrics
lyrics scraper for foobar2000 using JScript Panel. Ǫ�� ����ڷμ�, �� �� �˼� ���� �������� �� ���� ���ķ� �ѱ� ���� �������� �� ��������� �������.

## ���!
���� �ʹ��� �ʱ� ����... ���������� ���� ��.

## ���
1. Ǫ���� [JScript Panel](https://marc2k3.github.io/foo_jscript_panel.html)�� �̿��� �ڹٽ�ũ��Ʈ�� �����Ͽ� 
2. ������ �ֿ� ����Ʈ���� ���縦 �˻��ϰ� 
3. �˻� ��� ù ��° ���������� ���縦 ��ũ�������ؼ� 
4. ������ ������ `txt`�� �����Ѵ�.
5. ���縦 �����ϴ� �� ���̹Ƿ� Ǫ���� ��ǻ� ǥ�� ���� �÷����� [Lyric Show 3](https://www.foobar2000.org/components/view/foo_uie_lyrics3)�� �Բ� �������.

## �����ϴ� ����Ʈ �� �ΰ� ����
`fy_settings.js` ����.
1. [Genius](https://genius.com)  //�˻��� ���� �־� ��Ƽ��Ʈ�� Ÿ��Ʋ�� URL�� �����ϹǷ� �Ϻ����� �ʴ�.
2. [LyricWiki](https://lyrics.fandom.com)
3. ~~[AZlyrics](https://search.azlyrics.com)~~  //������ ������ ǰ���� ���ζ� ��Ȱ��ȭ
4. [Musixmatch](https://www.musixmatch.com)
5. [LyricsMode](https://www.lyricsmode.com)
6. ~~[SongMeanings](https://songmeanings.com)~~  //�����ϴ� ����Ʈ���� ���� �ӵ��� ������ ��Ȱ��ȭ�ص�.
7. [����](https://www.genie.co.kr)
8. [����](https://music.bugs.co.kr)  //�ܱ� ���� �˻� ����� �ſ� ������ ����...
9. ~~[��������](http://jieumai.com)~~  //�����ư� '��� �˻�'���� �˻� ����� ��� ã�ƾ� �ϹǷ� �����Ϸ��� ���Ҵ�.
10. [������](https://gasazip.com)

## ��ġ
1. JScript Panel�� ���ٸ� ���� ��ġ�ϰ�, �г��� UI�� �߰��Ѵ�.
2. Ǫ�� ����(`foobar2000`) �Ʒ� JScript ����(`user-components\foo_jscript_panel`)�� ���� 
3. `fy_lyrics` ������ ����� �ű⿡ �̰��� `fy_lyrics.txt.js`, `fy_settings.js`, `lib\unorm.js` ������ �޾Ƽ� �д�.
4. JScript �г��� ��Ŭ���ϰ� `Configure... > File > Import...` ���� �� ���� `fy_lyrics.txt.js` ������ �����ϰ� `[OK]` ��ư�� ������.
5. �뷡�� ���� ����ϸ� �۵� ����.

## `fy_settings.js` ����
1. �� ���Ͽ��� ���� ���� ��ġ�� �����ؾ� �Ѵ�(���� �⺻���� `Z:\lyrics`).
2. Lyric Show 3���� ���縦 �����ϴ� ������ ���� ������ ����. �׷����� �������...
3. ���� ����Ʈ�� �߰��� ���� �ְ�, ��ġ �ʴ� ����Ʈ�� ������ ���� �ִ�.
4. �� ���� ����ȭ�� ���߿�.

## ������Ƽ ���̼���
���Ͼ URL�� ���� �ǻ�Ʈ�� ��� �����ϴµ�, ES6 ����� �� ���� ���� [unorm](https://github.com/walling/unorm) �������� ���, MIT�� GPL ���� ���̼�����.

## ���� �����丮
- 0.1. 19-12-24, �ϴ� ����
- 0.2. 19-12-27, ���๮�� ������� ���� �ذ� ���.
- 0.3. 19-12-30, seperates settings, noUseIfHangul setting added, some setting changed, Gasazip added, setting and code refactoring
- 0.4. 19-12-31, setting and code refactoring

## todo
1. ~~���๮�� ������� ���� �ذ�. �ٵ� �̰� ������ js ������ ������ ��° �Ұ����� ��.~~
2. ���� ����ȭ
3. ���Ͼ API ���?
4. ���Ͼ���� �ѱ� ���� �� �� ã�� ���?
5. ���Ͼ���� �ѱ� �� ���� ���?
6. �ڵ� ������Ʈ. �̰� �׸� ����� ���� ��.
