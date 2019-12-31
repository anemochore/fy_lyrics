var UPDATE_URL_SCRIPT   = 'https://anemochore.github.io/fy_lyrics/fy_lyrics.txt.js';
var UPDATE_URL_SETTINGS = 'https://anemochore.github.io/fy_lyrics/fy_settings.js';
var SAVE_FOLDER = 'Z:\\lyrics';

//valid protocol is https or http only.
//for valid pathnameAndSearch, see http://bl.ocks.org/abernier/3070589
var SITES = [
  { name: 'Genius', 
    protocolAndHost: 'https://genius.com', 
    noSearch: true, 
    noSearchSplitter: ' ', 
    noSearchRegExpAndStrPairToReplace: [/[!"'’,\.\(\)\\\/\?]/g, ''], 
    noSearchAdditionalStrPairsToReplace: [['&', 'and'], [' ', '-']], 
    noSearchNormalizeToNFD: true, 
    noSearchCapitalize: true, 
    noSearchFinalSuffix: '-lyrics', 
    resultPageElQuery: 'div.lyrics', 
  },
  { name: 'LyricWiki', 
    protocolAndHost: 'https://lyrics.fandom.com', 
    pathnameAndSearch: '/wiki/Special:Search?query=', 
    firstResultLinkElQuery: 'a.result-link', 
    resultPageElQuery: 'div.lyricbox', 
    noUseIfHanguel: true, 
  },
  { name: 'AZlyrics', 
    protocolAndHost: 'https://search.azlyrics.com', 
    pathnameAndSearch: '/search.php?q=', 
    firstResultLinkParentElQuery: 'table', 
    firstResultLinkElQuery: 'a[target]', 
    failResultUrl: 'https://www.azlyrics.com/add.php', 
    resultPageElQuery: 'div:not([class])', 
    noUseIfHanguel: true, 
  },
  { name: 'Musixmatch', 
    protocolAndHost: 'https://www.musixmatch.com', 
    pathnameAndSearch: '/search/', 
    searchRegExpAndStrPairToReplace: [/[&#\?]/g, ' '], 
    firstResultLinkElQuery: 'a.title',
    resultPageScriptStartsWith: 'var __mxmProps', 
    resultPageScriptFirstStrToFind: '"body":"', 
    resultPageScriptEndStrToFind: '","language":', 
    excludeResultsMatch: ['Edit lyrics', 'Add lyrics'], 
  },
  { name: 'LyricsMode', 
    protocolAndHost: 'https://www.lyricsmode.com', 
    pathnameAndSearch: '/search.php?search=', 
    firstResultLinkElQuery: 'a.lm-link--primary', 
    resultPageElQuery: 'div#lyrics_text', 
    resultRegExpAndStrPairToReplace: [/\nExplain Request \r\n×$/, ''], 
    noUseIfHanguel: true, 
  },
  { name: '지니', 
    protocolAndHost: 'https://www.genie.co.kr', 
    pathnameAndSearch: '/search/searchMain?query=', 
    firstResultLinkElQuery: 'a.btn-basic', 
    firstResultLinkElOnclickRegExpAndStrPairToReplace: [/fnViewSongInfo\('|'\)|;|return false/g, ''], 
    resultPagePathnameAndSearch: '/detail/songInfo?xgnm=',
    resultPageElQuery: 'pre#pLyrics', 
    //useTextContent: true, 
    resultRegExpAndStrPairToReplace: [/\t+/g, '\n'], 
    excludeResultsInclude: ['가사 정보가 없습니다.']
  },
  { name: '벅스', 
    protocolAndHost: 'https://music.bugs.co.kr', 
    pathnameAndSearch: '/search/integrated?q=', 
    firstResultLinkElQuery: 'a.trackInfo', 
    resultPageElQuery: 'xmp', 
    useTextContent: true
  },
  { name: '가사집', 
    protocolAndHost: 'https://gasazip.com', 
    pathnameAndSearch: '/search.html?q=', 
    firstResultLinkElQuery: 'a.list-group-item', 
    resultPageElQuery: 'div#gasa', 
    resultRegExpAndStrPairToReplace: [/\r\n^\r\n/g, '\n'], 
  },

  //not supported but famous sites
  //google   //scraping blocked
  //metrolyrics   //too slow
  //flashlyrics: 'https://www.flashlyrics.com/lyrics'   //google search
  //jetlyrics: 'http://lyrics.jetmute.com/'  //romanized

  //not supported but famous sites in Korea
  //lyrics.co.kr: 'https://www.lyrics.co.kr/' //post method

  /* it's working, but disabled since it's too slow
  { name: 'SongMeanings', 
    protocolAndHost: 'https://songmeanings.com', 
    pathnameAndSearch: '/query/?query=', 
    firstResultLinkParentElQuery: 'td[class=""]', 
    firstResultLinkElQuery: 'a', 
    resultPageElQuery: 'div.holder', 
    resultRegExpAndStrPairToReplace: [/Edit Lyrics\nEdit Wiki\nAdd Video/, ''], 
  },
  */

  /*
  //일한 독음 및 번역... '계속 검색'해야 하므로 패스.
  { name: '지음아이', 
    protocolAndHost: 'http://jieumai.com', 
    pathnameAndSearch: '/xe/?_filter=search&mid=lyrics&search_target=title_content&search_keyword=', 
    firstResultLinkElQuery: {class: 'hx'}, 
    resultPageElQuery: 'article', 
  },
  */
];