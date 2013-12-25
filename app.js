
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var app = express();
app.configure('development', function(){
   // app.use(express.errorHandler());
    app.locals.pretty = true;
});
// all environments
app.set('port',process.env.port || 8080);
app.set('view engine','jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/public',express.static(__dirname + '/public'));

mongoose.connect('mongodb://127.0.0.1/todolist');
var listSchema = mongoose.Schema({
    content : String,
    date    : String,
    done    : Number
});
var listTask = mongoose.model('list',listSchema);
app.get('/',function(req,res){
   res.redirect('/all/1');
});

//View all task
app.get('/all/:number?',function(req,res){
    listTask.find().limit(3).skip((req.params.number-1)*3).exec(function(err,data){
        listTask.count(function (err, count) {
            if(err){
                console.log(err);
            } else {
                 res.render('index',{listTask : data,count:count});
            }
        });
    });
});

//View active
app.get('/active/:number?',function(req,res){
    listTask.find({done:0}).limit(3).skip((req.params.number-1)*3).exec(function(err,data){
        listTask.count({done:0},function (err, count) {
            if(err){
                console.log(err);
            } else {
                res.render('index',{listTask : data, count:count});
            }
        });
    });
});

//View completed
app.get('/completed/:number?',function(req,res){
    listTask.find({done:1}).limit(3).skip((req.params.number-1)*3).exec(function(err,data){
        listTask.count({done:1},function (err, count) {
            if(err){
                console.log(err);
            } else {
                res.render('index',{listTask : data, count:count});
            }
        });
    });
});

//Add new task
app.post('/add',function(req,res){
   new listTask({content: req.body.content,date: req.body.date}).save(function(err,list){
       if(err){
           res.json(list);
       } else {
           res.send(list._id);
       }
    });
});

//Update checked
app.post('/done/:id/:done',function(req,res){
    listTask.update(
        {_id:req.params.id},
        {done:req.params.done},
        function(err){
            if(err){
                return handleError(err);
            } else {
                res.send('OK');
            }
        })
});

//Update task
app.post('/update',function(req,res){
   listTask.update({_id:req.body.id},{content:req.body.title,date:req.body.date},function(err){
       if(err){
           return handleError(err);
       } else {
           res.send('OK');
       }
   });
});

//Delete
app.post('/delete',function(req,res){
    listTask.remove({_id:req.body.id},function(err){
        if(err){
            res.json(list);
        } else {
            res.send('OK');
        }
    });
});

//Search
app.get('/search',function(req,res){
    var title = req.param('title');
    listTask.find({content: new RegExp(title, 'i')},function(err,data){
        res.render('index',{listTask : data});
    });
})
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
