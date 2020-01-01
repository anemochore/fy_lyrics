var UPDATE_URL_SCRIPT   = 'https://anemochore.github.io/fy_lyrics/fy_lyrics.txt.js';
var UPDATE_URL_SETTINGS = 'https://anemochore.github.io/fy_lyrics/fy_settings.js';
var SAVE_FOLDER = 'Z:\\lyrics';

//valid protocol is https or http only.
//for valid pathnameAndSearch, see http://bl.ocks.org/abernier/3070589
var SITES = [
  { name: 'Genius', 
    protocolAndHost: 'https://genius.com', 
    pathnameAndSearch: '/', 
    noSearch: {
      noUseHangulArtistIfPresent: true, 
      regExpReplacePairs: [[/[!"'’,\.\(\)\\\/\?]/g, ''], [/&/g, 'and'], [/ /g, '-']],
      normalizeToNFD: true, 
      capitalize: true, 
      finalSuffix: '-lyrics', 
    },
    resultPage: {
      type: 'query', 
      query: 'div.lyrics', 
    },
    noUse: {
      ifHangulInArtist: true, 
      ifHangulInTitle: true, 
    },
  },
  { name: 'LyricWiki', 
    protocolAndHost: 'https://lyrics.fandom.com', 
    pathnameAndSearch: '/wiki/Special:Search?query=', 
    searchResult: {
      noUseHangulArtistIfPresent: true, 
      type: 'list', 
      query: 'li.result', 
      linkQuery: 'a', 
      artistQuery: 'a', 
      artistTextRegExpMatch: /^(.+):/, 
    },
    resultPage: {
      type: 'query', 
      query: 'div.lyricbox', 
    },
    noUse: {
      ifHangulInArtist: true, 
      ifHangulInTitle: true, 
    },
  },
  { name: 'AZlyrics', 
    protocolAndHost: 'https://search.azlyrics.com', 
    pathnameAndSearch: '/search.php?q=', 
    searchResult: {
      noUseHangulArtistIfPresent: true, 
      type: 'list', 
      query: 'td.text-left.visitedlyr',
      linkQuery: 'a', 
      artistQuery: 'td>b', 
      failResultUrl: 'https://www.azlyrics.com/add.php', 
    },
    resultPage: {
      type: 'query', 
      query: 'div:not([class])', 
    },
    noUse: {
      ifHangulInArtist: true, 
      ifHangulInTitle: true, 
    },
  },
  { name: 'Musixmatch', 
    protocolAndHost: 'https://www.musixmatch.com', 
    pathnameAndSearch: '/search/', 
    searchResult: {
      noUseHangulArtistIfPresent: true, 
      type: 'first', 
      query: 'a.title',
      regExpReplacePairs: [[/[&#\?]/g, ' ']], 
    },
    resultPage: {
      type: 'script_parsing', 
      scriptStartsWith: 'var __mxmProps', 
      scriptFirstStrToFind: '"body":"', 
      scriptEndStrToFind: '","language":', 
      regExpReplacePairs: [[/\\n/g, '\n'], [/\\"/g, '"']], 
    },
    excludeResults: {
      match: ['Edit lyrics', 'Add lyrics'], 
    },
  },
  { name: 'LyricsMode', 
    protocolAndHost: 'https://www.lyricsmode.com', 
    pathnameAndSearch: '/search.php?search=', 
    searchResult: {
      noUseHangulArtistIfPresent: true, 
      type: 'first', 
      query: 'a.lm-link--primary', 
    },
    resultPage: {
      type: 'query', 
      query: 'div#lyrics_text', 
      regExpReplacePairs: [[/\nExplain Request \r\n×$/, '']], 
    },
    noUse: {
      ifHangulInArtist: true, 
      ifHangulInTitle: true, 
    },
  },
  { name: '지니',  //todo: oohyo는 검색 X, 우효는 O
    protocolAndHost: 'https://www.genie.co.kr', 
    pathnameAndSearch: '/search/searchMain?query=', 
    searchResult: {
      type: 'first', 
      query: 'a.btn-basic', 
      onclickPathnameAndSearch: '/detail/songInfo?xgnm=',
      onclickParamRegExpReplacePairs: [[/fnViewSongInfo\('|'\)|;|return false/g, '']], 
    },
    resultPage: {
      type: 'query', 
      query: 'pre#pLyrics', 
      regExpReplacePairs: [[/\t+/g, '\n']], 
    },
    excludeResults: {
      include: ['가사 정보가 없습니다.'],
    },
  },
  { name: '벅스', 
    protocolAndHost: 'https://music.bugs.co.kr', 
    pathnameAndSearch: '/search/integrated?q=', 
    searchResult: {
      type: 'list', 
      query: 'table.lyrics>tbody>tr[albumid]', 
      linkQuery: 'a.trackInfo', 
      titleQuery: 'p.title', 
      artistQuery: 'p.artist', 
    },
    resultPage: {
      type: 'query', 
      query: 'xmp', 
    },
  },
  { name: '가사집', 
    protocolAndHost: 'https://gasazip.com', 
    pathnameAndSearch: '/search.html?q=', 
    searchResult: {
      type: 'list', 
      query: 'a.list-group-item', 
      titleQuery: 'h4', 
      titleQueryNode: 'firstChild', 
      titleTextRegExpMatch: /^(.+)\n/, 
      artistQuery: 'code', 
    },
    resultPage: {
      type: 'query', 
      query: 'div#gasa', 
      regExpReplacePairs: [[/\r\n^\r\n/g, '\n']], 
    },
  },

  //not supported but famous sites
  //google   //scraping blocked
  //metrolyrics   //too slow
  //SongMeanings   //too slow
  //지음아이: 일한 독음 및 번역... '계속 검색'해야 하므로 패스.
  //flashlyrics: 'https://www.flashlyrics.com/lyrics'   //google search
  //jetlyrics: 'http://lyrics.jetmute.com/'  //romanized
  //lyrics.co.kr: 'https://www.lyrics.co.kr/' //post method

];