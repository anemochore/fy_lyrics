var UPDATE_URL_SCRIPT   = 'https://anemochore.github.io/fy_lyrics/fy_lyrics.txt.js';
var UPDATE_URL_SETTINGS = 'https://anemochore.github.io/fy_lyrics/fy_settings.js';
var SAVE_FOLDER = 'Z:\\lyrics';

//valid protocol is https or http only.
//for valid pathnameAndSearch, see http://bl.ocks.org/abernier/3070589
var SITES = [
  { name: 'Genius', 
    protocolAndHost: 'https://genius.com', 
    noSearch: true, 
    noSearchRegExpAndStrPairToReplace: [/[!"'’,\.\(\)\\\/\?]/g, ''], 
    noSearchAdditionalStrPairsToReplace: [['&', 'and'], [' ', '-']], 
    noSearchNoHangulArtist: true, 
    noSearchNormalizeToNFD: true, 
    noSearchCapitalize: true, 
    noSearchFinalSuffix: '-lyrics', 
    resultPageElQuery: 'div.lyrics', 
  },
  { name: 'LyricWiki', 
    protocolAndHost: 'https://lyrics.fandom.com', 
    pathnameAndSearch: '/wiki/Special:Search?query=', 
    searchResultArtistAndTitleElQuery: 'li.result', 
    searchResultArtistAndTitleElLinkElQuery: 'a', 
    searchResultArtistAndTitleElArtistElQuery: 'a', 
    searchResultArtistAndTitleElArtistElTextRegExpMatch: /^(.+):/, 
    resultPageElQuery: 'div.lyricbox', 
    noUseIfHangulInArtist: true, 
    noUseIfHangulInTitle: true, 
  },
  { name: 'AZlyrics', 
    protocolAndHost: 'https://search.azlyrics.com', 
    pathnameAndSearch: '/search.php?q=', 
    searchResultArtistAndTitleElQuery: 'td.text-left.visitedlyr',
    searchResultArtistAndTitleElLinkElQuery: 'a', 
    searchResultArtistAndTitleElArtistElQuery: 'td>b', 
    failResultUrl: 'https://www.azlyrics.com/add.php', 
    resultPageElQuery: 'div:not([class])', 
    noUseIfHangulInArtist: true, 
    noUseIfHangulInTitle: true, 
  },
  { name: 'Musixmatch', 
    protocolAndHost: 'https://www.musixmatch.com', 
    pathnameAndSearch: '/search/', 
    searchNoHangulArtist: true, 
    searchRegExpAndStrPairToReplace: [/[&#\?]/g, ' '], 
    searchResultLinkElQuery: 'a.title',
    resultPageScriptStartsWith: 'var __mxmProps', 
    resultPageScriptFirstStrToFind: '"body":"', 
    resultPageScriptEndStrToFind: '","language":', 
    excludeResultsMatch: ['Edit lyrics', 'Add lyrics'], 
  },
  { name: 'LyricsMode', 
    protocolAndHost: 'https://www.lyricsmode.com', 
    pathnameAndSearch: '/search.php?search=', 
    searchNoHangulArtist: true, 
    searchResultLinkElQuery: 'a.lm-link--primary', 
    resultPageElQuery: 'div#lyrics_text', 
    resultRegExpAndStrPairToReplace: [/\nExplain Request \r\n×$/, ''], 
    noUseIfHangulInTitle: true, 
  },
  { name: '지니', 
    protocolAndHost: 'https://www.genie.co.kr', 
    pathnameAndSearch: '/search/searchMain?query=', 
    searchResultLinkElQuery: 'a.btn-basic', 
    searchResultLinkElOnclickRegExpAndStrPairToReplace: [/fnViewSongInfo\('|'\)|;|return false/g, ''], 
    resultPagePathnameAndSearch: '/detail/songInfo?xgnm=',
    resultPageElQuery: 'pre#pLyrics>p', 
    resultRegExpAndStrPairToReplace: [/\t+/g, '\n'], 
    excludeResultsInclude: ['가사 정보가 없습니다.']
  },
  { name: '벅스', 
    protocolAndHost: 'https://music.bugs.co.kr', 
    pathnameAndSearch: '/search/integrated?q=', 
    searchResultArtistAndTitleElQuery: 'table.lyrics>tbody>tr[albumid]', 
    searchResultArtistAndTitleElLinkElQuery: 'a.trackInfo', 
    searchResultArtistAndTitleElTitleElQuery: 'p.title', 
    searchResultArtistAndTitleElArtistElQuery: 'p.artist', 
    resultPageElQuery: 'xmp', 
    useTextContent: true
  },
  { name: '가사집', 
    protocolAndHost: 'https://gasazip.com', 
    pathnameAndSearch: '/search.html?q=', 
    searchResultArtistAndTitleElQuery: 'a.list-group-item', 
    searchResultArtistAndTitleElTitleElQuery: 'h4', 
    searchResultArtistAndTitleElTitleElQueryNode: 'firstChild', 
    searchResultArtistAndTitleElTitleElTextRegExpMatch: /^(.+)\n/, 
    searchResultArtistAndTitleElArtistElQuery: 'code', 
    resultPageElQuery: 'div#gasa', 
    resultRegExpAndStrPairToReplace: [/\r\n^\r\n/g, '\n'], 
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