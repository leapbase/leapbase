# Introduction

Leapbase is a powerful and extensible web application platform.


# Start web server

```
npm start
```


# Change setting file

```
cd site
rm setting.js
ln -s setting/setting-local.js setting.js
```


# Git Setup

```
git config user.name $GITHUB_USER_NAME
git config user.email $GITHUB_USER_EMAIL

git config credential.helper 'cache --timeout=3600'
git config credential.helper store

git config --list
```
