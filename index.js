const express = require('express');
const fu = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.json"));
const port = config.settings.port;
const host = config.settings.host;
const morgan = require('morgan');
const _ = require('lodash');
const app = express();
require('dotenv').config();
const admin_key = process.env.ADMIN;
const now = Date.now();
const timezone = require('moment-timezone');
const curdate = timezone.tz(now, 'Europe/Prague').format('DD.MM.YYYY HH:mm:SS');
const auser = process.env['user'];
const apass = process.env['pass'];

//*midleware
app.use(fu({
    createParentPath: true
}));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set('view engine', 'ejs');

//*Functions
const generateFolder = () => {
    var length = 5,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}



//*requests
app.post('/upload', async (req, res) => {
try {
        if (!req.files) {
            res.format({
                'text/plain': function () {
                  res.send('Bad Request | 400');
                  res.send('You need to upload a file');
                },
              
                'text/html': function () {
                  res.send('<center><h1>Bad Request | 400</h1>');
                  res.send('<br><hr><br>');
                  res.send('<p>You need to upload a file</p>');
                },
              
                'application/json': function () {
                  res.send({
                      code: 400,
                      title: "Bad Request",
                      description: "You need to upload a file"
                  });
                },
              
                default: function () {
                  // log the request and respond with 406
                  res.status(406).send('Not Acceptable')
                }
              });
        } else {
            let file = req.files.file;
            let gen_folder = generateFolder();

            let file_info = {
                name: file.name,
                size: file.size+" B",
                sizeKB: file.size / 1000 + " KB",
                type: file.mimeType,
                uploaded: curdate,
                generatedFolder: gen_folder,
                type: file.mimetype
            };

            file.mv(__dirname+"/uploads/files/"+gen_folder+"___"+file.name);
            fs.writeFileSync(__dirname+"/uploads/jsons/"+gen_folder+"___"+file.name+".json", JSON.stringify(file_info));

            res.json({url: host+gen_folder+"/"+file.name, embed: host+"e/"+gen_folder+"/"+file.name});
            console.log("New File Uploaded at "+curdate);
            console.log("========================================================");
            console.log("'"+host+gen_folder+"/"+file.name+"' || '"+gen_folder+"___"+file.name+"'");
        }
    } catch (err) {
        res.status(500).send({
            code: 500,
            title: "Internal Server Error"
        });
        console.log(err);
    };

});
app.get("/:folder/:file", async (req, res) => {
  try {
    var folder = req.params.folder;
    var name = req.params.file;
    var filecheck = fs.readFileSync(__dirname+"/uploads/jsons/"+folder+"___"+name+".json");
    var file_info = JSON.parse(fs.readFileSync(__dirname+`/uploads/jsons/${folder}___${name}.json`));
    if (!filecheck) res.status(404).json({code:404, title: "Not Found"});
    if (folder !== file_info.generatedFolder) res.status(404).json({code:404, title: "Not Found"});
    res.status(200).sendFile(__dirname+`/uploads/files/${folder}___${name}`);
  } catch (err) {
    res.status(404).json({code:404, title: "Not Found"});
    console.log(err); 
  }
});
app.get("/e/:folder/:file", async(req, res) => {
  try {
    var folder = req.params.folder;
    var name = req.params.file;
    var imgurl = host+folder+"/"+name;
    var filecheck = fs.readFileSync(__dirname+"/uploads/jsons/"+folder+"___"+name+".json");
    var file_info = JSON.parse(fs.readFileSync(__dirname+`/uploads/jsons/${folder}___${name}.json`));
    if (!filecheck) res.status(404).json({code:404, title: "Not Found"});
    if (folder !== file_info.generatedFolder) res.status(404).json({code:404, title: "Not Found"});
    if (file_info.type === "image/jpeg") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<img src='"+imgurl+"' style='background-color: #2c2c2c;border-radius: 10px;' height='512px'>",
        what: "image"
      });
    } else if (file_info.type === "image/jpg") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<img src='"+imgurl+"' style='background-color: #2c2c2c;border-radius: 10px;' height='512px'>",
        what: "image"
      });
     } else if (file_info.type === "image/png") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<img src='"+imgurl+"' style='background-color: #2c2c2c;border-radius: 10px;' height='512px'>",
        what: "image"
      });
     } else if (file_info.type === "video/mp4") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<video controls style='background-color: #2c2c2c;border-radius: 10px;' height='512px'><source src='"+imgurl+"' type='video/mp4'>Your browser does not support HTML5 video.</video>",
        what: "video"
      });
     } else if (file_info.type === "video/avi") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<video controls style='background-color: #2c2c2c;border-radius: 10px;' height='512px'><source src='"+imgurl+"' type='video/avi'>Your browser does not support HTML5 video.</video>",
        what: "video"
      });
     } else if (file_info.type === "audio/mpeg") {
      res.render(__dirname+"/embed.ejs", {
        name: file_info.name,
        size: file_info.sizeKB,
        uDate: file_info.uploaded,
        path: file_info.generatedFolder+"/"+file_info.name,
        url: imgurl,
        type: file_info.type,
        element: "<audio controls style='background-color: #2c2c2c;border-radius: 10px;' height='512px'><source src='"+imgurl+"' type='audio/mpeg'>Your browser does not support HTML5 video.</audio>"
      });
     } else {
      res.redirect(host+folder+"/"+name).end();
    }
  } catch (err) {
    res.status(404).json({code:404, title: "Not Found"});
    console.log(err); 
  }
});
app.get("*", async (req, res) => {
  if (req.query.upload === "show") {
    res.status(200).sendFile(__dirname+"/upload.html");
  } else {
    res.status(200).send("<style>body {display: flex;justify-content:center;align-items:center;} h1::hover {font-size:200%;transition:0.2s;}</style><body><h1>"+host+"upload</h1></body>");
  }
  
});

app.listen(port, () => {
    console.log("Web Started : " + port);
});
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
});
  
process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
});
