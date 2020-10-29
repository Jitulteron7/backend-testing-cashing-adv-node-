const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Blog = mongoose.model('Blog');
require("../services/cashe");
module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // const redis=require("redis");
    // const redisURL="redis://127.0.0.1:6379";
    // const client=redis.createClient(redisURL);
    // const util=require("util");
    // client.get = util.promisify(client.get)
    // // to avoid use to call backwe make the function to return a promise;
    // const casheUser=await client.get(req.user.id);
    // if(casheUser){
    //   console.log("data from cashe");
    //   return res.send(JSON.parse(casheUser));
    // }



    // from here also we are getting queries 
    console.log("data from mongodb");
    const blogs = await Blog.find({ _user: req.user.id });
    
    res.send(blogs);
    // client.set(req.user.id,JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
