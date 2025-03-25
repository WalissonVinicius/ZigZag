<div align="center">
  <img src="https://i.imgur.com/KNFRvwF.png"><br>
</div>
<br>
<br>

#

## Instalação

Após ter clonado o repositório e extraído todos os arquivos, tenha certeza que possui o [node.js](https://nodejs.org/en/)(versão mais recente) e o [npm](https://www.npmjs.com/). Caso esteja com tudo pronto, execute o seguinte comando no diretorio dos arquivos:

```sh
$ npm install
ou
$ yarn
```

Se estiver tudo certo, crie um arquivo com o nome de **.env** seguindo o exemplo do **[.env.example]()** com o seguinte comando:

- Windows

```sh
$ copy .env.example .env
```

- Linux

```sh
$ cp .env.example .env
```

| Opção        | Descrição                                      | Obrigatório? |
| ------------ | ---------------------------------------------- | ------------ |
| AUTH_TOKEN   | Token de autenticação do seu bot               | sim          |
| PREFIX       | Prefixo dos comandos                           | sim          |
| RIOT_API_KEY | Chave de API da Riot Games (para comandos LoL) | não          |
| LOL_REGION   | Região do servidor de LoL (br1, euw1, etc.)    | não          |

Feito isso, você poderá iniciar seu bot utilizando o seguinte comando:

```sh
$ npm start
ou
$ yarn start
```

## Funcionalidades

### Comandos de League of Legends

O bot agora possui comandos relacionados ao jogo League of Legends! Para utilizar todos os recursos, você precisa de uma chave de API da Riot Games, que pode ser obtida em [https://developer.riotgames.com/](https://developer.riotgames.com/).

Lista de comandos de LoL:

| Comando   | Descrição                                          | Uso                            |
| --------- | -------------------------------------------------- | ------------------------------ |
| invocador | Mostra informações de um jogador                   | !invocador [nome do invocador] |
| campeao   | Exibe detalhes sobre um campeão                    | !campeao [nome do campeão]     |
| rotacao   | Mostra a rotação gratuita de campeões da semana    | !rotacao                       |
| elo       | Exibe informações sobre os diferentes elos do jogo | !elo [nome do elo]             |
| build     | Mostra builds recomendadas para um campeão         | !build [nome do campeão]       |

Os comandos de League of Legends funcionam perfeitamente com servidores dedicados ao jogo, permitindo que os membros vejam informações úteis sem sair do Discord!
