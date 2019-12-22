var SAVE_FOLDER = 'Z:\\lyrics';

var SITES = [
  { name: 'Genius', 
    protocolAndHost: 'https://genius.com', 
    /* not working
    pathnameAndSearch: '/search?q=', 
    firstResultLinkElObj: {class: 'mini_card'}, 
    */
    noSearch: true, 
    splitter: ' ', 
    regExpToRemove: /[!"'’,\.\(\)\\\/\?]/g, 
    strPairsToReplace: [['&', 'and'], [' ', '-']], 
    normalizeToNFD: true, 
    capitalize: true, 
    finalSuffix: '-lyrics', 
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
    resultPageElTag: 'div', 
    resultPageElObj: {class: null}
  },
  { name: 'Musixmatch', 
    protocolAndHost: 'https://www.musixmatch.com', 
    pathnameAndSearch: '/search/', 
    firstResultLinkElObj: {class: 'title'},
    resultPageParentElTag: 'div', 
    resultPageParentElObj: {class: 'mxm-lyrics'}, 
    resultPageParentElNumberToSkipIfMultiple: 1, 
    resultPageElTag: 'span', 
    resultPageElObj: null,
    excludeResults: ['Edit lyrics', 'Add lyrics']
  },
  { name: 'LyricsMode', 
    protocolAndHost: 'https://www.lyricsmode.com', 
    pathnameAndSearch: '/search.php?search=', 
    firstResultLinkElObj: {class: 'lm-link lm-link--primary lm-link--highlight'}, 
    resultPageElTag: 'div', 
    resultPageElObj: {id: 'lyrics_text'}
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
    firstResultLinkElObj: {class: 'title ellipsis'}, 
    firstResultLinkElOnclickStringsToRemove: ["fnPlaySong('", ";','1');return false;"],
    resultPagePathnameAndSearch: '/detail/songInfo?xgnm=',
    resultPageParentElTag: 'pre', 
    resultPageParentElObj: {id: 'pLyrics'}, 
    resultPageElTag: 'p', 
    resultPageElObj: null,
    excludeResults: ['가사 정보가 없습니다.']
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