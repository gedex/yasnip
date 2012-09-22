/**
 * App dependencies.
 */
var express = require("express")
    , app = express()
    , redis = require("redis")
    , rc = redis.createClient()
    , langs = require('./langs')
    , cp = require('child_process');


/**
 * App config.
 */
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    
    // Middleware
    app.use(express.static(__dirname + '/assets'));
    app.use(express.bodyParser());
    app.use(app.router);
});


/**
 * App routing.
 */
app.get('/add', function(req, res) {
    res.render('add', {
        langs: langs.langs
    });
});
app.post('/add', function(req, res) {
    rc.incr("nextId", function(err, id) {
        if (!err) {
            // Save raw snippet
            rc.set('raw_snips:id:' + id, JSON.stringify(req.param('snip', '')), function(err, reply) {
                if (err) {
                    console.log(err);
                }
            });

            var out = "";
            // Spawn pygmentize and save the result via set
            var pyg = cp.spawn("pygmentize", ["-l", req.param('lang', 'html')
                ,"-f", "html"
                ,"-O", "'style=pastie'"
            ]);
            pyg.stdout.on("data", function(data) {
                console.log("pygmentize: on data");
                out += data;
            });
            pyg.on("exit", function(code) {
                console.log("pygmentize: exiting")
                if (code !== 0) {
                    console.log("pygmentize process exited with code " + code);
                } else {
                    // Save highlighted snippet
                    rc.set('snips:id:' + id, JSON.stringify(out), function(err, reply) {
                        if (!err) {
                            // redirect to newly added snip
                            res.redirect('/view/' + id);
                        } else {
                            // TODO: give 500 page, something wrong during set snip
                            console.log(err);
                        }
                    });
                }
                pyg.stdin.end();
            });

            pyg.stderr.on("data", function(data) {
                console.log("pygmentize err: " + data);
                pyg.stdin.end();
            });

            pyg.stdin.write(req.param('snip', ''));
            pyg.stdin.end();
        } else {
            // TODO: give 500 page, unable to inc nextId
            console.log(err);
        }
    });
});

app.get('/view/:id/:format?', function(req, res) {
    var id = req.params.id
        , format = req.params.format;

    switch(format) {
        case "raw":
            rc.get("raw_snips:id:" + id, function(err, snip) {
                if (!err) {
                    res.header("Content-Type", "text/plain; charset=utf-8");
                    res.send(JSON.parse(snip));
                } else {
                    // TODO: give 404 page, unable to find raw_snip
                    console.log(err);
                }
            });
            break;
        default:
            rc.get("snips:id:" + id, function(err, snip) {
                if (!err) {
                    res.render('view', {
                        id: id
                        , snip: JSON.parse(snip)
                    });
                } else {
                    // TODO: give 404 page, unable to find snip with given id
                    console.log(err);
                }
            });
    }
});
app.get('/', function(req, res) {
    res.render('index', {
        title: 'Index',
        langs: langs.langs
    });
});

app.listen(3000, function() {
    console.log("Listening on port 3000");
});
