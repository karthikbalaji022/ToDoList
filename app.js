const express = require("express");
const body = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();
const date=require(__dirname+"/date.js");
 console.log(date);
app.use(body.urlencoded({extended:true}));
app.use(express.static("public"));

// let item=[];
// let working=[];

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-kb:kb123@cluster0-ivwrb.mongodb.net/toDoListDb",{useNewUrlParser: true });
const itemSchema={
  name: String
};
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"Welcome to todo list"
});

const item2=new Item({
  name:"Press the + button to add a toDo"
});

const item3=new Item({name:"<-- press to delete"});

let item4=new Item({name:String});

const listSchema={
  name:String,
  items:[itemSchema],
};

const List=mongoose.model("List",listSchema);

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {

  // let day=date.GetDay();
Item.find({},function(err,found){
  if(found.length==0)
  {
    Item.insertMany(defaultItems,function(err,docs){
      console.log(docs+" done");
    });
    res.redirect("/");
  }else{
  res.render("list", {
    theDay:"Today",
    NewItem:found,
  });
}
});

});
app.post("/",function(req,res){
const inp=req.body.UserInput;
const configPage=req.body.list;
const item=new Item({name:inp});

if(configPage.toLowerCase()==="today")
{
  item.save();
  res.redirect("/");

}else{
  List.findOne({name:configPage},function(err,result){
    result.items.push(item);
    result.save();
    res.redirect("/"+configPage);
  });
}
   console.log("posted ");
   console.log(req.body);
});

app.post("/delete",function(req,res){
  const toDelete=req.body.checkbox;
  const listDelete=req.body.listname;
  console.log(listDelete);
  if(listDelete.toLowerCase()==="today"){
  Item.deleteOne({_id:toDelete},function(err){})
  res.redirect("/")

}else
  {
    List.findOneAndUpdate({name:listDelete},{$pull:{items:{_id:toDelete}}},function(err,found){
      res.redirect("/"+listDelete);
    });
  }
});


app.get("/:configName", function(req,res){
  const customListName=_.capitalize(req.params.configName);
  List.findOne({name:customListName},function(err,result){
    if(!result)
    {
      const list=new List({
        name:customListName,
        items:defaultItems,
      })
      list.save();
      res.redirect("/"+customListName);
    }else{
      console.log("Path name already exists");
      res.render("list", {
        theDay:result.name,
        NewItem:result.items,
      });
    }
  });

});
// app.get("/work",function(req,res){
//   res.render("list",{theDay:"work list", NewItem:working})
// });
//
// app.post("/work",function(req,res){
//   let WorkItem=req.body.UserInput;
//   working.push(WorkItem);
// });
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("the server is running");
});
