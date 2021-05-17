const rootDivEl = document.querySelector("#root");

let users = [];
let posts = [];
let selectedUser = null;

getUsersFromServer().then(function (usersFromServer) {
  users = usersFromServer;
});

getPostsFromServer().then(function (postsFromServer) {
  posts = postsFromServer;
  createHeader();
  createMainSection();
});

function createHeader() {
  const headerEl = document.createElement("header");
  headerEl.setAttribute("class", "main-header");

  const wrapperEl = document.createElement("div");
  wrapperEl.setAttribute("class", "wrapper");

  for (user of users) {
    const userCardEl = createUserCard(user);
    wrapperEl.append(userCardEl);
  }

  headerEl.append(wrapperEl);
  rootDivEl.append(headerEl);
}

function createUserCard(user) {
  const userCardEl = document.createElement("div");
  userCardEl.setAttribute("class", "chip");

  const avatarEl = document.createElement("div");
  avatarEl.setAttribute("class", "avatar-small");

  const imgEl = document.createElement("img");
  imgEl.setAttribute("alt", user.username);
  imgEl.src = user.avatar;

  const spanEl = document.createElement("span");
  spanEl.innerText = user.username;

  avatarEl.append(imgEl);
  userCardEl.append(avatarEl, spanEl);

  userCardEl.addEventListener("click", function () {
    const previuslySelectedEl = document.querySelector(".chip.active");
    if (previuslySelectedEl != null) {
      previuslySelectedEl.classList.remove("active");
    }
    selectedUser = user;
    userCardEl.classList.add("active");
  });

  return userCardEl;
}

function createMainSection() {
  const mainEl = document.createElement("main");
  mainEl.setAttribute("class", "wrapper");

  const createPostEl = document.createElement("section");
  createPostEl.setAttribute("class", "create-post-section");

  const feedEl = createFeed();

  mainEl.append(createPostEl, feedEl);
  rootDivEl.append(mainEl);
}

function createFeed() {
  const feedEl = document.createElement("section");
  feedEl.setAttribute("class", "feed");

  const ulEl = document.createElement("ul");
  ulEl.setAttribute("class", "stack");

  for (const post of posts) {
    const postEl = createPost(post);
    ulEl.append(postEl);
  }

  feedEl.append(ulEl);
  return feedEl;
}

function createPost(post) {
  const postEl = document.createElement("li");
  postEl.setAttribute("class", "post");

  let user = users.find(function (user) {
    return user.id === post.userId;
  });

  const userCardEl = createUserCard(user);

  const postImgEl = document.createElement("div");
  postImgEl.setAttribute("class", "post--image");

  const imgEl = document.createElement("img");
  imgEl.setAttribute("alt", "undefined");
  imgEl.src = post.image.src;

  const postContentEl = document.createElement("div");
  postContentEl.setAttribute("class", "post--content");

  const h2El = document.createElement("h2");
  h2El.innerText = post.title;

  const pEl = document.createElement("p");
  pEl.innerText = post.content;

  const postCommentsEl = document.createElement("div");
  postCommentsEl.setAttribute("class", "post--comments");

  const h3El = document.createElement("h3");
  h3El.innerText = "Comments";
  postCommentsEl.append(h3El);

  for (const comment of post.comments) {
    let postCommentElement = createComment(comment);
    postCommentsEl.append(postCommentElement);
  }

  postContentEl.append(h2El, pEl);
  postImgEl.append(imgEl);
  postEl.append(userCardEl, postImgEl, postContentEl, postCommentsEl);

  //add comment form
  const commentFormEl = document.createElement("form");
  commentFormEl.setAttribute("id", "create-comment-form");
  commentFormEl.setAttribute("autocomplete", "off");

  const commentLabelEl = document.createElement("label");
  commentLabelEl.setAttribute("for", "comment");
  commentLabelEl.innerText = "Add comment";

  const inputEl = document.createElement("input");
  inputEl.setAttribute("id", "comment");
  inputEl.setAttribute("name", "comment");
  inputEl.setAttribute("type", "text");

  const buttonEl = document.createElement("button");
  buttonEl.setAttribute("type", "submit");
  buttonEl.innerText = "Comment";

  commentFormEl.addEventListener("submit", function (event) {
    event.preventDefault();

    if (selectedUser !== null) {
      // - get and store comment data
      const comment = {
        content: commentFormEl.comment.value,
        userId: selectedUser.id,
        postId: post.id,
      };
      fetch("http://localhost:3000/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (newCommentFromServer) {
          const postCommentElement = createComment(newCommentFromServer);
          postCommentsEl.append(postCommentElement);
          commentFormEl.reset();
        });
    } else {
      alert("Please select a user first");
    }
  });

  commentFormEl.append(commentLabelEl, inputEl, buttonEl);

  postContentEl.append(h2El, pEl);
  postImgEl.append(imgEl);
  postEl.append(
    userCardEl,
    postImgEl,
    postContentEl,
    postCommentsEl,
    commentFormEl
  );

  return postEl;
}

function createComment(comment) {
  const postCommentElement = document.createElement("div");
  postCommentElement.setAttribute("class", "post--comment");

  const user = users.find(function (user) {
    return user.id === comment.userId;
  });

  const avatarEl = document.createElement("div");
  avatarEl.setAttribute("class", "avatar-small");

  const commentImgEl = document.createElement("img");
  commentImgEl.setAttribute("alt", user.username);
  commentImgEl.src = user.avatar;

  const commentPEl = document.createElement("p");
  commentPEl.innerText = comment.content;

  avatarEl.append(commentImgEl);
  postCommentElement.append(avatarEl, commentPEl);

  return postCommentElement;
}

function getPostsFromServer() {
  return fetch("http://localhost:3000/posts").then(function (response) {
    return response.json();
  });
}

function getUsersFromServer() {
  return fetch("http://localhost:3000/users").then(function (response) {
    return response.json();
  });
}
