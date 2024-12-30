const express = require('express');
const fs = require('fs');
const joi = require('joi');
const app = express();

const filePath = 'users.json';

const userScheme = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().min(0).max(99).required(),
  city: joi.string().min(1)
});

app.use(express.json());

const readUsersFromFile = () => {
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const users = JSON.parse(fileContent);
      if (Array.isArray(users)) {
        return users;
      }
    } catch (err) {
      console.error('Ошибка при чтении или парсинге файла:', err);
    }
  }
  return []; 
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};


app.get('/users', (req, res) => {
  const users = readUsersFromFile();
  res.send({ users });
});

app.get('/users/:id', (req, res) => {
  const users = readUsersFromFile();
  const userId = +req.params.id;
  const user = users.find(user => user.id === userId);
  if (user) {
    res.send({ user });
  } else {
    res.status(404).send({ user: null });
  }
});


app.post('/users', (req, res) => {
  const result = userScheme.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }

  const users = readUsersFromFile();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, ...req.body };

  users.push(newUser);
  writeUsersToFile(users);

  res.send({ id: newId });
});


app.put('/users/:id', (req, res) => {
  const result = userScheme.validate(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details });
  }

  const users = readUsersFromFile();
  const userId = +req.params.id;
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex !== -1) {
    users[userIndex] = { id: userId, ...req.body };
    writeUsersToFile(users);
    res.send({ user: users[userIndex] });
  } else {
    res.status(404).send({ user: null });
  }
});


app.delete('/users/:id', (req, res) => {
  const users = readUsersFromFile();
  const userId = +req.params.id;
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsersToFile(users);
    res.send({ user: deletedUser });
  } else {
    res.status(404).send({ user: null });
  }
});


app.listen(3000);