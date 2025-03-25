/** O Comando "elo" mostra informações sobre os elos do League of Legends */

const Discord = require('discord.js')

module.exports = {
  run: async (client, message, args) => {
    const elos = {
      'ferro': {
        cor: '#5D4037',
        descricao: 'Jogadores neste elo geralmente estão começando no jogo. Costumam ter conhecimento limitado sobre mecânicas básicas, rotações de mapa e outros conceitos fundamentais.',
        percentual: 'Aproximadamente 7% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/iron_1.png'
      },
      'bronze': {
        cor: '#BF8970',
        descricao: 'Jogadores de Bronze geralmente conhecem os básicos, mas ainda cometem muitos erros. Problemas comuns incluem baixo farm, falta de consciência do mapa e rotações ineficientes.',
        percentual: 'Aproximadamente 24% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/bronze_1.png'
      },
      'prata': {
        cor: '#95A5A6',
        descricao: 'Jogadores de Prata têm um entendimento mais sólido das mecânicas básicas, mas ainda têm dificuldades com consistência. Começam a entender objetivos e tempo de jogo, mas frequentemente falham na execução.',
        percentual: 'Aproximadamente 35% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/silver_1.png'
      },
      'ouro': {
        cor: '#F1C40F',
        descricao: 'Jogadores de Ouro normalmente têm um bom entendimento das mecânicas do jogo e começam a desenvolver uma compreensão mais profunda da sua lane e função. Jogam de forma mais coordenada como equipe.',
        percentual: 'Aproximadamente 23% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/gold_1.png'
      },
      'platina': {
        cor: '#1ABC9C',
        descricao: 'Jogadores de Platina têm uma compreensão bastante avançada do jogo, bom controle de campeões e conhecimento mais profundo sobre matchups. Entendem melhor a macro do jogo e importância dos objetivos.',
        percentual: 'Aproximadamente 7% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/platinum_1.png'
      },
      'diamante': {
        cor: '#3498DB',
        descricao: 'Jogadores de Diamante têm habilidades mecânicas refinadas, excelente conhecimento de lane, entendem perfeitamente todas as mecânicas do jogo e sabem como jogar no mapa de acordo com a composição de time.',
        percentual: 'Aproximadamente 2.5% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/diamond_1.png'
      },
      'mestre': {
        cor: '#9B59B6',
        descricao: 'Jogadores de Mestre são extremamente habilidosos e têm um conhecimento excepcionalmente profundo sobre todos os aspectos do jogo. Geralmente especialistas em suas funções e altamente consistentes.',
        percentual: 'Aproximadamente 0.3% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/master_1.png'
      },
      'grão-mestre': {
        cor: '#E67E22',
        descricao: 'Jogadores de Grão-Mestre estão entre os mais talentosos do servidor. Têm um conhecimento quase perfeito do jogo e excelentes habilidades mecânicas. Muitos streamers e jogadores semi-profissionais estão neste elo.',
        percentual: 'Aproximadamente 0.1% dos jogadores ranqueados',
        imagem: 'https://opgg-static.akamaized.net/images/medals/grandmaster_1.png'
      },
      'desafiante': {
        cor: '#E74C3C',
        descricao: 'Jogadores Desafiantes são a elite absoluta. Este elo é composto principalmente por jogadores profissionais, streamers de destaque e talentos em ascensão. O mais alto nível de jogo competitivo em filas ranqueadas.',
        percentual: 'Apenas os top 300 jogadores por servidor',
        imagem: 'https://opgg-static.akamaized.net/images/medals/challenger_1.png'
      }
    }

    if (!args[0]) {
      // Se não for especificado um elo, mostrar resumo de todos
      const embed = new Discord.MessageEmbed()
        .setTitle('🏆 Elos do League of Legends')
        .setDescription('Escolha um elo específico para ver mais detalhes usando `!elo [nome do elo]`')
        .setColor(process.env.COLOR)
        .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
        .setTimestamp()
      
      for (const [nome, info] of Object.entries(elos)) {
        embed.addField(
          nome.charAt(0).toUpperCase() + nome.slice(1), 
          `${info.percentual}`, 
          true
        )
      }
      
      return message.channel.send(embed)
    }
    
    // Procurar o elo específico
    const eloNome = args.join(' ').toLowerCase()
    const elo = elos[eloNome] || Object.entries(elos).find(([key]) => key.includes(eloNome))?.[1]
    
    if (!elo) {
      return message.channel.send(`Elo \`${args.join(' ')}\` não encontrado. Elos disponíveis: ${Object.keys(elos).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}.`)
    }
    
    // Mostrar informações do elo específico
    const embed = new Discord.MessageEmbed()
      .setTitle(`🏆 Elo: ${eloNome.charAt(0).toUpperCase() + eloNome.slice(1)}`)
      .setDescription(elo.descricao)
      .addField('Distribuição', elo.percentual, true)
      .setColor(elo.cor)
      .setThumbnail(elo.imagem)
      .setFooter('2024 © League of Legends Bot', 'https://i.imgur.com/LVacCMS.png')
      .setTimestamp()
    
    return message.channel.send(embed)
  },

  conf: {},

  help: {
    name: 'elo',
    category: 'LoL',
    description: 'Mostra informações sobre os elos do League of Legends',
    usage: '!elo [nome do elo]',
    aliases: ['rank', 'tier']
  }
} 