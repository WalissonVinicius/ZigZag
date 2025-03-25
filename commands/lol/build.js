/** O Comando "build" mostra as builds mais populares para um campeão */

const Discord = require('discord.js')
const axios = require('axios')

// Função para remover tags HTML do texto
function removerTagsHTML(texto) {
  if (!texto) return '';
  // Remove tags de cor e outras tags HTML
  return texto.replace(/<(?:.|\n)*?>/gm, '');
}

module.exports = {
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.channel.send(`${message.author}, você precisa fornecer o nome do campeão! Use: \`${process.env.PREFIX}build [nome do campeão]\``)
    }

    const championName = args.join(' ').toLowerCase()
    const language = 'pt_BR'
    
    try {
      message.channel.send(`Buscando builds para: \`${args.join(' ')}\`...`)
      
      // Obter versão atual do jogo
      const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
      const currentVersion = versionsResponse.data[0]
      
      // Obter lista de campeões
      const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${language}/champion.json`)
      const champions = championsResponse.data.data
      
      // Encontrar o campeão pelo nome (pesquisa parcial)
      let championKey = null
      
      for (const key in champions) {
        const champ = champions[key]
        if (champ.name.toLowerCase() === championName) {
          championKey = key
          break
        } else if (champ.name.toLowerCase().includes(championName)) {
          championKey = key
        }
      }
      
      if (!championKey) {
        return message.channel.send(`Campeão \`${args.join(' ')}\` não encontrado. Verifique o nome e tente novamente.`)
      }
      
      // Obter informações detalhadas do campeão
      const championResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/${language}/champion/${championKey}.json`)
      const championData = championResponse.data.data[championKey]
      
      // Limpar possíveis tags HTML do nome e título
      const champName = removerTagsHTML(championData.name);
      const champTitle = removerTagsHTML(championData.title);
      
      // Buscar dados de build (simulados - em um bot real, você buscaria de uma API real como op.gg, u.gg, etc)
      // Neste exemplo estamos simulando a resposta
      const buildData = getSimulatedBuildData(championData)
      
      // Criar embed com as builds
      const embed = new Discord.MessageEmbed()
        .setTitle(`Build para ${champName} - ${champTitle}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${championData.image.full}`)
        .setDescription(`Build recomendada baseada nas estatísticas atuais.`)
        .setColor(process.env.COLOR)
        .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
        .setTimestamp()
      
      // Adicionar informações de runas
      embed.addField('🔮 Runas Principais', buildData.runas.principais.join('\n'))
      embed.addField('⭐ Runas Secundárias', buildData.runas.secundarias.join('\n'))
      
      // Adicionar informações de itens iniciais
      embed.addField('🛒 Itens Iniciais', buildData.itens.iniciais.join('\n'))
      
      // Adicionar informações de itens principais
      embed.addField('🛡️ Build Completa', buildData.itens.completos.join('\n'))
      
      // Adicionar ordem de habilidades
      embed.addField('📊 Ordem de Habilidades', 
        `1-3: ${buildData.habilidades.inicio}\n` +
        `Prioridade: ${buildData.habilidades.ordem}`)
      
      // Adicionar conjuradores
      embed.addField('✨ Feitiços de Invocador', buildData.feiticos.join(', '))
      
      // Adicionar informações extras (remover HTML se necessário)
      embed.addField('💡 Dicas', removerTagsHTML(buildData.dicas))
      
      // Adicionar uma imagem do campeão
      embed.setImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg`)
      
      return message.channel.send(embed)
    } catch (error) {
      console.error('Erro ao buscar build de campeão:', error)
      return message.channel.send('Ocorreu um erro ao buscar as informações de build. Tente novamente mais tarde.')
    }
  },

  conf: {},

  help: {
    name: 'build',
    category: 'LoL',
    description: 'Mostra as builds mais populares para um campeão do League of Legends',
    usage: '!build [nome do campeão]',
    aliases: ['builds', 'guia']
  }
}

// Função para gerar dados de build simulados com base no tipo de campeão
function getSimulatedBuildData(championData) {
  // Determinar o tipo de campeão (mago, lutador, atirador, etc.)
  const tags = championData.tags

  // Objetos de builds para diferentes tipos de campeões
  const buildTypes = {
    Assassin: {
      runas: {
        principais: ['⚡ Dominação: Colheita Sombria', '👣 Gosto de Sangue', '👁️ Sentinela Zumbi', '🏃 Caçador Incansável'],
        secundarias: ['🌀 Precisão: Triunfo', '💪 Golpe de Misericórdia']
      },
      itens: {
        iniciais: ['Lâmina Longa + 3 Poções', 'ou', 'Espada do Doran + Poção'],
        completos: ['Garra do Espreitador', 'Botas Ionianas da Lucidez', 'Rastro de Serralum', 'Fio da Infinito', 'Limiar da Noite', 'Anjo Guardião']
      },
      habilidades: {
        inicio: 'Q W E',
        ordem: 'R > Q > E > W'
      },
      feiticos: ['Flash', 'Ignite'],
      dicas: 'Procure eliminar alvos prioritários como magos e atiradores. Aproveite momentos de rotação para emboscar inimigos isolados.'
    },
    Mage: {
      runas: {
        principais: ['🔮 Feitiçaria: Invocar Aery', '🎯 Faixa de Fluxo de Mana', '⏱️ Transcendência', '☄️ Chamuscar'],
        secundarias: ['🧠 Inspiração: Entrega de Biscoitos', '⏰ Perspicácia Cósmica']
      },
      itens: {
        iniciais: ['Anel do Doran + 2 Poções', 'ou', 'Selo do Protetor Sombrio + 2 Poções'],
        completos: ['Capítulo Perdido do Liandry', 'Botas Ionianas da Lucidez', 'Abraço Demoníaco', 'Cajado do Arcanjo', 'Ampulheta de Zhonya', 'Chapéu Deathcap de Rabadon']
      },
      habilidades: {
        inicio: 'Q E W',
        ordem: 'R > Q > W > E'
      },
      feiticos: ['Flash', 'Teleporte'],
      dicas: 'Posicione-se atrás do seu time e utilize suas habilidades para controle de grupo. Mantenha distância segura de assassinos e lutadores.'
    },
    Marksman: {
      runas: {
        principais: ['🎯 Precisão: Ritmo Fatal', '🩸 Triunfo', '💉 Lenda: Linhagem', '💪 Golpe de Misericórdia'],
        secundarias: ['🔴 Dominação: Gosto de Sangue', '👁️ Caçador Incansável']
      },
      itens: {
        iniciais: ['Espada do Doran + Poção', 'ou', 'Lâmina Longa + 3 Poções'],
        completos: ['Mata-Cráquens', 'Botas Galvanizadas de Aço', 'Furacão de Runaan', 'Fio da Infinito', 'Dançarina Fantasma', 'Anjo Guardião']
      },
      habilidades: {
        inicio: 'Q E W',
        ordem: 'R > Q > E > W'
      },
      feiticos: ['Flash', 'Curar'],
      dicas: 'Foque em farmar durante a fase de rotas. Posicione-se bem nas lutas em equipe e ataque sempre o alvo mais próximo com segurança.'
    },
    Fighter: {
      runas: {
        principais: ['💥 Precisão: Conquistador', '🩸 Triunfo', '🔄 Lenda: Tenacidade', '💪 Último Suspiro'],
        secundarias: ['🌳 Resolução: Demolir', '🛡️ Condicionamento']
      },
      itens: {
        iniciais: ['Escudo do Doran + Poção', 'ou', 'Lâmina do Corrupto + 2 Poções'],
        completos: ['Mata-Cráquens', 'Botas Galvanizadas de Aço', 'Hidra Raivosa', 'Força da Trindade', 'Placa Deadman', 'Espírito Visagem']
      },
      habilidades: {
        inicio: 'Q E W',
        ordem: 'R > Q > E > W'
      },
      feiticos: ['Flash', 'Teleporte'],
      dicas: 'Use sua mobilidade e resistência para dividir o mapa e criar pressão. Busque duelos individuais para tirar vantagem.'
    },
    Tank: {
      runas: {
        principais: ['🌳 Resolução: Aperto dos Mortos-Vivos', '🛡️ Fonte da Vida', '🧱 Condicionamento', '🪨 Crescimento Excessivo'],
        secundarias: ['💥 Inspiração: Calçados Mágicos', '💫 Perspicácia Cósmica']
      },
      itens: {
        iniciais: ['Escudo do Doran + Poção', 'ou', 'Refúgio de Cloth + 4 Poções'],
        completos: ['Égide de Fogo Solar', 'Botas Galvanizadas de Aço', 'Coração Congelado', 'Manto da Mortalha', 'Placa Deadman', 'Espírito Visagem']
      },
      habilidades: {
        inicio: 'Q E W',
        ordem: 'R > Q > W > E'
      },
      feiticos: ['Flash', 'Teleporte'],
      dicas: 'Inicie lutas em equipe e absorva o dano inimigo. Proteja seus aliados de longo alcance e use controle de grupo para desestabilizar o time inimigo.'
    },
    Support: {
      runas: {
        principais: ['💫 Inspiração: Kleptomancia', '⌚ Calçados Mágicos', '🍪 Entrega de Biscoitos', '⏰ Perspicácia Cósmica'],
        secundarias: ['🔮 Feitiçaria: Manto de Nimbus', '⏱️ Transcendência']
      },
      itens: {
        iniciais: ['Relíquia do Escudo Antigo', 'ou', 'Moeda Antiga de Ladino + 2 Poções'],
        completos: ['Mandamento de Shurelya', 'Botas da Mobilidade', 'Redenção', 'Incensório de Mikael', 'Convergência de Zeke', 'Proteção do Cavaleiro']
      },
      habilidades: {
        inicio: 'Q W E',
        ordem: 'R > W > E > Q'
      },
      feiticos: ['Flash', 'Ignite'],
      dicas: 'Mantenha seu atirador seguro durante a fase de rotas. Providencie visão constante do mapa e ajude o jungler em objetivos.'
    }
  }

  // Verificar o tipo principal do campeão
  let buildType = 'Fighter' // Padrão
  
  for (const tag of tags) {
    if (buildTypes[tag]) {
      buildType = tag
      break
    }
  }
  
  return buildTypes[buildType]
} 