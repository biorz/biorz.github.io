(function($) {
    function setStore(id, k, v) {
        var store = window.localStorage.__store__;
        if(!store) {
            store = {}
            store[id] = {}
        }else {
            store = JSON.parse(store);
            if (!store[id]) store[id] = {}
        }
        store[id][k] = v;
        window.localStorage.__store__ = JSON.stringify(store)
    }

    function getStore(id, k, def) {
        var store = window.localStorage.__store__;
        if(!store) return def;
        store = JSON.parse(store);
        if(!store[id]) return def;

        return store[id][k] === undefined ? def : store[id][k];
    }

    function updateViews(Class, url, callback, o) {
        getViews(Class, url, function (results) {
            if(results.length > 0) {
                var id = results[0].id;
                var time = results[0].attributes.time;
                var nowTime = time + 1

                var counter = AV.Object.createWithoutData(Class, id);
                counter.increment('time', 1);
                counter.save(null, {fetchWhenSave: true}).then(function (data) {
                    callback && callback(data)
                }, function (error) {
                    console.log("更新网络计数器失败: " + error);
                });
            }
            else {
                var Counter = AV.Object.extend(Class);
                var newCounter = new Counter();
                o = !!o ? o : {};
                for(var k in o) {
                    console.log(k, o[k])
                    newCounter.set(k, o[k]);
                }
                newCounter.save(null, {fetchWhenSave: true}).then(function (data) {
                    callback && callback(data)
                }, function (error) {
                    console.log("新增条目失败: " + error);
                });
            }
        })
    }

    function getViews(Class, url, callback) {
        var query = new AV.Query(Class);
        query.equalTo('url', url);
        query.find().then(function (results) {
            callback && callback(results);
        })
    }

    //  main start
    function updateCount(wrappers) {
        wrappers.each(function (idx) {
            _item = $(this);
            var link = _item.find('.article-title a');
            var url = link.attr("href").trim();
            var title = link.text().trim();
            if(!(url && title)) return;

            (function (_item) {
                getViews('Liker', url, function (results) {
                    var time;
                    if(results.length > 0) {
                        time = results[0].attributes.time;
                    }
                    time = !!time ? time : 0;
                    _item.find(".summary-count").text(time)
                })
            }(_item))
        })
    }

    function initHitStatus(wrapper, url, title) {
        if(!(url && title)) return;

        updateViews("Counter", url, function (data) {
            var time = data.attributes.time;
            time = !!time ? time : 0;
            wrapper.find('.hits-count').text(time)
        },{
            title : title,
            url: url,
            time: 1
        })
    }

    function initLikeState(wrapper, url, title) {
        if(!(url && title)) return;

//            initState
        var likerWrapper = wrapper.find('.likes-counter')
        var liked = getStore(url, 'liked');
        if( !!liked ) {
            wrapper.find('.like-group').addClass('liked');
        }

        getViews('Liker', url, function (results) {
            var time;
            if(results.length > 0) {
                time = results[0].attributes.time;
            }
            time = !!time ? time : 0;
            wrapper.find('.likes-count').text(time);
        })

//            initEvent
        $('.likes-counter').click(function (e) {
            _this = $(this);
            var liked = getStore(url, 'liked');
            if( liked ) return

            updateViews('Liker', url, function(data) {
                var time = data.attributes.time;
                time = !!time ? time : 0;
                setStore(url, 'liked', true);
                wrapper.find('.like-group').addClass('liked');
                wrapper.find('.likes-count').text(time)

            },{
                title : title,
                url: url,
                time: 1
            })
        })
    }

    //  entry
    var singleArticle = $('.article-single')
    if (singleArticle.length == 1) {
        var _href = singleArticle.find('.article-date-link').attr('href');
        var url = !!_href ? _href.trim() : '';
        var title = singleArticle.find('.article-title').text().trim();

        initHitStatus(singleArticle, url, title)
        initLikeState(singleArticle, url, title)
    }

    var summarys = $(".article-summary");
    if(summarys.length > 0) {
        updateCount(summarys);
    }

})(jQuery)
