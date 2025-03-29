# Water Management Backend

Este é o backend do projeto Water Management

## Project Setup

```sh
npm install
```

##Criar as Migrações

Caso o projeto possua migrações pendentes, você pode gerar as migrações do banco de dados executando:

```sh
npx sequelize-cli db:migrate
```

##Rodar Seeders (opcional)
Se houver dados iniciais a serem inseridos no banco de dados, rode os seeders com o comando:

```sh
npx sequelize-cli db:seed:all
```

## Como Criar e Rodar Novas Migrações

Para criar novas migrações ou modelos, use os seguintes comandos:

```sh
npx sequelize-cli migration:generate --name nome-da-migracao
```

##Criar um modelo:

```sh
npx sequelize-cli model:generate --name NomeModelo --attributes nome:string,idade:intege
```

Após criar uma migração ou modelo, pode se aplicar as migrações com:

```sh
npx sequelize-cli db:migrate
```

## Desfazer Migrações ou Seeders

Desfazer a última migração

```sh
npx sequelize-cli db:migrate:undo
```

Desfazer todas as migrações:

```sh
npx sequelize-cli db:migrate:undo:all
```

Desfazer todos os seeders:

```sh
npx sequelize-cli db:seed:undo:all
```
