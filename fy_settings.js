var SAVE_FOLDER = 'Z:\\lyrics';

//valid protocol is https or http only.
//for valid pathnameAndSearch, see http://bl.ocks.org/abernier/3070589
var SITES = [
  { name: 'Genius', 
    protocolAndHost: 'https://genius.com', 
    /* not working. they blocked
    pathnameAndSearch: '/search?q=', 
    firstResultLinkElObj: {class: 'mini_card'}, 
    */
    noSearch: true, 
    noSearchSplitter: ' ', 
    noSearchRegExpToRemove: /[!"'’,\.\(\)\\\/\?]/g, 
    noSearchStrPairsToReplace: [['&', 'and'], [' ', '-']], 
    noSearchNormalizeToNFD: true, 
    noSearchCapitalize: true, 
    noSearchFinalSuffix: '-lyrics', 
    resultPageElTag: 'div', 
    resultPageElObj: {class: 'lyrics'}
  },
  { name: 'LyricWiki', 
    protocolAndHost: 'https://lyrics.fandom.com', 
    pathnameAndSearch: '/wiki/Special:Search?query=', 
    firstResultLinkElObj: {class: 'result-link'},
    resultPageElTag: 'div', 
    resultPageElObj: {class: 'lyricbox'}
  },
  { name: 'AZlyrics', 
    protocolAndHost: 'https://search.azlyrics.com', 
    pathnameAndSearch: '/search.php?q=', 
    firstResultLinkElObj: {class: null}, 
    failResultUrl: 'https://www.azlyrics.com/add.php', 
    resultPageElTag: 'div', 
    resultPageElObj: {class: null}
  },
  { name: 'Musixmatch', 
    protocolAndHost: 'https://www.musixmatch.com', 
    pathnameAndSearch: '/search/', 
    searchRegExpAndStrPairToReplace: [/[&#\?]/g, ' '], 
    firstResultLinkElObj: {class: 'title'},
    resultPageScriptStartsWith: 'var __mxmProps', 
    resultPageScriptFirstStrToFind: '"body":"', 
    resultPageScriptEndStrToFind: '","language":', 
    /* without newline-character version
    resultPageParentElTag: 'div', 
    resultPageParentElObj: {class: 'mxm-lyrics'}, 
    resultPageParentElNumberToSkipIfMultiple: 1, 
    resultPageElTag: 'span', 
    resultPageElObj: null,
    */
    /* without newline-character version (another)
    resultPageParentElTag: 'div', 
    resultPageParentElObj: {class: 'mxm-lyrics'}, 
    resultPageElTag: 'p', 
    resultPageElObj: {class: 'mxm-lyrics__content '}, 
    resultPageTakeAllEl: true, 
    */
    excludeResultsMatch: ['Edit lyrics', 'Add lyrics']
  },
  { name: 'LyricsMode', 
    protocolAndHost: 'https://www.lyricsmode.com', 
    pathnameAndSearch: '/search.php?search=', 
    firstResultLinkElObj: {class: 'lm-link lm-link--primary lm-link--highlight'}, 
    resultPageElTag: 'div', 
    resultPageElObj: {id: 'lyrics_text'}, 
    resultRegExpToRemove: /\nExplain Request \r\n×$/ 
  },
  /* it's working, but disabled since it's too slow
  { name: 'SongMeanings', 
    protocolAndHost: 'https://songmeanings.com', 
    pathnameAndSearch: '/query/?query=', 
    firstResultLinkParentElTag: 'td', 
    firstResultLinkParentElObj: {class: ''}, 
    firstResultLinkElObj: null, 
    resultPageElTag: 'div', 
    resultPageElObj: {class: 'holder lyric-box'}
  },
  */
  { name: '지니', 
    protocolAndHost: 'https://www.genie.co.kr', 
    pathnameAndSearch: '/search/searchMain?query=', 
    firstResultLinkElObj: {class: 'btn-basic btn-info'}, 
    firstResultLinkElOnclickRegExpToRemove: /fnViewSongInfo\('|'\)|;|return false/g, 
    resultPagePathnameAndSearch: '/detail/songInfo?xgnm=',
    resultPageElTag: 'pre', 
    resultPageElObj: {id: 'pLyrics'}, 
    useTextContent: true, 
    replaceTabsTo: '\n', 
    /* without newline-character version 
    resultPageParentElTag: 'pre', 
    resultPageParentElObj: {id: 'pLyrics'}, 
    resultPageElTag: 'p', 
    resultPageElObj: null,
    */
    excludeResultsInclude: ['가사 정보가 없습니다.']
  },
  { name: '벅스', 
    protocolAndHost: 'https://music.bugs.co.kr', 
    pathnameAndSearch: '/search/integrated?q=', 
    firstResultLinkElObj: {class: 'trackInfo'}, 
    resultPageElTag: 'xmp', 
    resultPageElObj: null,
    useTextContent: true
  },

  //not supported but famous sites
  //google   //scraping blocked
  //metrolyrics   //too slow
  //flashlyrics: 'https://www.flashlyrics.com/lyrics'   //google search
  //jetlyrics: 'http://lyrics.jetmute.com/'  //romanized

  //not supported but famous sites in Korea
  //lyrics.co.kr: 'https://www.lyrics.co.kr/' //post method
  //gasazip: 'https://gasazip.com/'           //google search

  /*
  //일한 독음 및 번역... '계속 검색'해야 하므로 패스.
  { name: '지음아이', 
    protocolAndHost: 'http://jieumai.com', 
    pathnameAndSearch: '/xe/?_filter=search&mid=lyrics&search_target=title_content&search_keyword=', 
    firstResultLinkElObj: {class: 'hx'}, 
    resultPageElTag: 'article', 
    resultPageElObj: null
  }
  */
];