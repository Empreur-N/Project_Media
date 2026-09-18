package com.media.content.config;

import com.media.content.model.Article;
import com.media.content.model.ArticleStatus;
import com.media.content.repository.ArticleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Chargeur automatique des articles officiels de LIFE CHANNEL
 * Importés depuis les canaux officiels :
 * - Life Channel Sports (@LifeChannelSports)
 * - Life UP TV Goma (@LifechannelG / @lifeuptv)
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final ArticleRepository articleRepository;

    public DataLoader(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Override
    public void run(String... args) {
        if (articleRepository.count() == 0) {
            List<Article> initialArticles = List.of(
                Article.builder()
                    .title("Léopards de la RDC : Sébastien Desabre peaufine sa stratégie offensive pour les éliminatoires")
                    .summary("À l'approche des prochaines échéances internationales, le sélectionneur des Léopards accentue le travail tactique autour de la transition rapide et de l'intégration des binationaux.")
                    .content("Au centre d'entraînement des Léopards, l'ambiance est à la concentration maximale. Le sélectionneur Sébastien Desabre a dirigé une séance intensive axée sur le pressing haut et la circulation rapide du ballon, des principes qui ont fait la force de la République Démocratique du Congo lors de ses dernières sorties continentales.\n\nLe capitaine Chancel Mbemba, véritable roc de la défense centrale, a rappelé aux troupes l'importance de maintenir une rigueur tactique irréprochable : « Chaque match sous les couleurs de la RDC est une mission pour le peuple. Nous savons ce que les supporters attendent de nous et nous sommes prêts à donner le meilleur sur le terrain. »\n\nEn attaque, la complicité entre Yoane Wissa et les ailiers dynamise les phases de transition. Desabre a particulièrement insisté sur le repli défensif coordonné et l'exploitation des couloirs face aux blocs bas. Avec un groupe soudé et confiant, les Léopards abordent les qualifications avec l'ambition ferme de conforter leur leadership dans leur groupe.")
                    .category("Sport")
                    .region("Kinshasa")
                    .tags("Léopards, RDC, Sébastien Desabre, Football, CAN, Éliminatoires, Chancel Mbemba")
                    .mainImageUrl("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Life Channel Sports")
                    .publicationDate(LocalDateTime.now().minusHours(4))
                    .createdAt(LocalDateTime.now().minusHours(4))
                    .build(),

                Article.builder()
                    .title("Nord-Kivu : Les jeunes de Goma se mobilisent pour la paix et la cohésion communautaire")
                    .summary("Reportage exclusif au cœur des collectifs de jeunes du chef-lieu du Nord-Kivu qui multiplient les initiatives de dialogue citoyen, d'éducation et d'entraide solidaire.")
                    .content("Dans les quartiers de Goma, du centre-ville jusqu'aux faubourgs de Birere et Majengo, une nouvelle génération d'acteurs de changement fait entendre sa voix. Portés par la conviction que le développement passe avant tout par la cohésion sociale, plusieurs collectifs de jeunes organisent des ateliers de formation civique et d'entrepreneuriat solidaire.\n\n« Notre mission est d'offrir des perspectives concrètes à la jeunesse et de prouver que Goma est une ville de résilience, de créativité et d'avenir », explique un coordinateur associatif lors d'un forum communautaire sur les rives du lac Kivu.\n\nLes débats ont réuni des étudiants, des animateurs de radios locales et des chefs de quartier autour de solutions pratiques : accès à la formation professionnelle, assainissement des avenues et promotion d'une information vérifiée pour contrer les rumeurs sur les réseaux sociaux. Une dynamique inspirante qui témoigne de la vitalité indomptable de l'Est congolais.")
                    .category("Société")
                    .region("Nord-Kivu")
                    .tags("Goma, Nord-Kivu, Jeunesse, Paix, Société, Résilience, Éducation")
                    .mainImageUrl("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Life UP TV Goma")
                    .publicationDate(LocalDateTime.now().minusDays(1))
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build(),

                Article.builder()
                    .title("Mercato : Les performances éclatantes de Yoane Wissa et la montée en puissance des talents congolais")
                    .summary("Décryptage des trajectoires européennes des attaquants de la diaspora congolaise, dont les statistiques remarquables confirment l'ascension du football de RDC au plus haut niveau.")
                    .content("Chaque week-end sur les pelouses de Premier League et des grands championnats européens, les internationaux congolais confirment leur statut d'éléments incontournables. L'attaquant Yoane Wissa enchaîne les prestations décisives avec son club, alliant percussion, sens du placement et réalisme devant le but adverse.\n\nCette montée en puissance rejaillit directement sur l'équipe nationale de la RDC. Le staff technique dirigé par Sébastien Desabre suit de près l'évolution des pépites binationaux, à l'image du prometteur défenseur Jorthy Mokio, dont la maturité technique suscite l'admiration des observateurs.\n\nPour les supporters congolais à Kinshasa comme à Lubumbashi ou dans la diaspora, ces performances alimentent la ferveur populaire. Les analyses tactiques diffusées sur notre chaîne YouTube @LifeChannelSports soulignent une confiance retrouvée et une réputation grandissante du joueur congolais sur le marché mondial des transferts.")
                    .category("Sport")
                    .region("Kinshasa")
                    .tags("Mercato, Premier League, Yoane Wissa, Jorthy Mokio, Football, RDC, Léopards")
                    .mainImageUrl("https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Life Channel Sports")
                    .publicationDate(LocalDateTime.now().minusDays(1).minusHours(6))
                    .createdAt(LocalDateTime.now().minusDays(1).minusHours(6))
                    .build(),

                Article.builder()
                    .title("Goma Ville Verte : Coup d'envoi d'une vaste campagne citoyenne de reboisement urbain")
                    .summary("Face aux défis de l'érosion et de la pression démographique, des centaines de volontaires ont planté plus de 5 000 arbres d'essences locales pour reverdir les collines volcaniques.")
                    .content("Sous un ciel matinal dégagé face aux massifs des Virunga, les équipes de volontaires de Goma ont lancé ce samedi la première phase de l'opération « Goma Ville Verte ». Cette initiative participative a mobilisé des élèves, des agents municipaux et des acteurs de la société civile avec pour objectif de planter des milliers de jeunes pousses le long des axes majeurs et sur les pentes vulnérables.\n\nLes experts environnementaux locaux soulignent que ces plantations permettront de stabiliser les sols volcaniques friables, de réduire la poussière en saison sèche et d'offrir des zones d'ombrage salutaires dans les quartiers à forte densité d'habitation.\n\n« Chaque arbre planté aujourd'hui est une promesse d'air pur et de protection pour nos enfants demain », a confié une enseignante engagée dans le projet. Les organisateurs prévoient un suivi régulier avec un comité citoyen de gardiennage pour veiller à la croissance des plantations tout au long de la saison des pluies.")
                    .category("Environnement")
                    .region("Nord-Kivu")
                    .tags("Environnement, Goma, Reboisement, Écologie, Climat, Nord-Kivu, Virunga")
                    .mainImageUrl("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Life UP TV Goma")
                    .publicationDate(LocalDateTime.now().minusDays(2))
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build(),

                Article.builder()
                    .title("Haut-Katanga & Lualaba : La transformation locale des minerais au centre des perspectives économiques")
                    .summary("À Kolwezi et Lubumbashi, la chaîne de valeur du cuivre et du cobalt évolue vers davantage de raffinage sur place, créant de nouvelles opportunités d'emplois industriels.")
                    .content("Au cœur de la ceinture cuprifère du Grand Katanga, l'activité industrielle connaît une évolution décisive. Les directives nationales encourageant la transformation sur le territoire congolais incitent les opérateurs miniers à investir dans des unités modernes d'hydrométallurgie et de raffinage.\n\nCette transition vise à dépasser le modèle d'exportation brute pour capter davantage de valeur ajoutée locale. À Kolwezi, capitale mondiale du cobalt, les investissements dans les infrastructures énergétiques et routières accompagnent l'émergence d'entreprises sous-traitantes détenues par des capitaux nationaux.\n\nSur le plan macroéconomique, la consolidation de cette filière contribue au soutien des réserves de change et à la stabilité relative du Franc Congolais. Les experts de notre Desk Économie soulignent toutefois la nécessité d'intensifier la formation technique des jeunes ingénieurs congolais pour répondre à la demande croissante de l'industrie technologique verte.")
                    .category("Économie")
                    .region("Haut-Katanga")
                    .tags("Économie, Mines, Cuivre, Cobalt, Kolwezi, Lubumbashi, Haut-Katanga, Industrie")
                    .mainImageUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Desk Économie RDC")
                    .publicationDate(LocalDateTime.now().minusDays(3))
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build(),

                Article.builder()
                    .title("Rumba Congolaise et Nouveaux Sons : L'effervescence artistique des studios de Kinshasa et Goma")
                    .summary("De l'héritage légendaire inscrit à l'UNESCO aux collaborations modernes mêlant Rumba, Afropop et Amapiano, la scène musicale congolaise réaffirme son leadership continental.")
                    .content("Les studios d'enregistrement de Bandalungwa et Matonge à Kinshasa, tout comme ceux du centre culturel de Goma, ne dorment jamais. Une nouvelle vague de compositeurs et d'arrangeurs s'emploie à moderniser les harmonies classiques de la Rumba tout en intégrant des rythmes contemporains qui enflamment les plateformes de streaming mondiales.\n\n« Notre patrimoine est immense. La Rumba n'est pas un son figé dans le passé, c'est une philosophie vivante qui raconte les joies, les peines et les espoirs de notre peuple », témoigne un jeune producteur kinois.\n\nCette vivacité se reflète également dans les festivals de musique qui reprennent avec vigueur à travers le pays. Entre concerts acoustiques, ateliers de guitare solo et chorégraphies virales sur TikTok, la créativité congolaise demeure un puissant ambassadeur culturel et un moteur d'intégration pour les artistes émergents.")
                    .category("Culture")
                    .region("Kinshasa")
                    .tags("Culture, Rumba, Musique, Kinshasa, Goma, Art, UNESCO, Créativité")
                    .mainImageUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Rédaction Culturelle Life")
                    .publicationDate(LocalDateTime.now().minusDays(4))
                    .createdAt(LocalDateTime.now().minusDays(4))
                    .build(),

                Article.builder()
                    .title("Diplomatie régionale : Poursuite des consultations de Luanda pour la pacification durable de l'Est")
                    .summary("Les délégations diplomatiques intensifient les réunions techniques pour concrétiser les engagements de sécurité et garantir le retour sécurisé des populations déplacées.")
                    .content("Dans les couloirs des chancelleries africaines, le dossier de la sécurité dans l'Est de la RDC reste en tête des priorités de l'agenda régional. Les pourparlers engagés sous la médiation de Luanda se poursuivent avec pour point cardinal le respect strict de la souveraineté territoriale de la République Démocratique du Congo.\n\nLes discussions portent sur le déploiement effectif des mécanismes de vérification ad hoc et le désengagement sans condition des groupes armés non étatiques. Sur le terrain diplomatique, Kinshasa réitère sa position ferme quant à l'intangibilité de ses frontières et l'urgence humanitaire qui frappe les familles déplacées dans les territoires du Nord-Kivu et de l'Ituri.\n\nLes acteurs de la société civile et les médias indépendants continuent de relayer les aspirations fondamentales des citoyens : le rétablissement sans délai de l'autorité de l'État, la réouverture des corridors d'approvisionnement agricole et la reprise normale de la scolarité pour des dizaines de milliers d'enfants.")
                    .category("Politique")
                    .region("Kinshasa")
                    .tags("Politique, Diplomatie, RDC, Luanda, Paix, Sécurité, Kinshasa, Nord-Kivu")
                    .mainImageUrl("https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Desk Politique & Diplomatie")
                    .publicationDate(LocalDateTime.now().minusDays(5))
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build(),

                Article.builder()
                    .title("No Comment : L'éveil matinal du Port de Goma et le départ des navires sur le Lac Kivu")
                    .summary("Images brutes et ambiance sonore du littoral lacustre au petit matin : débarquement de vivres, embarquement des passagers et vitalité commerciale entre Goma et Bukavu.")
                    .content("Dès 5 heures du matin, le port public de Goma s'anime d'un ballet incessant. Les bateaux reliant le Nord-Kivu et le Sud-Kivu manœuvrent dans la brume matinale pendant que les dockers déchargent cageots de tomates, sacs de pommes de terre et poissons frais du lac.\n\nCe couloir lacustre constitue le poumon économique reliant Goma et Bukavu, assurant le ravitaillement quotidien des marchés malgré les difficultés des voies terrestres.\n\nÀ travers ce reportage No Comment sans commentaire superflu, LIFE CHANNEL donne à voir le courage quotidien des commerçantes et des marins qui maintiennent la circulation des biens et des personnes avec une dignité exemplaire.")
                    .category("Société")
                    .region("Nord-Kivu")
                    .tags("No Comment, Goma, Lac Kivu, Bukavu, Transport, Commerce, Société")
                    .mainImageUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200")
                    .status(ArticleStatus.PUBLISHED)
                    .authorUsername("Life UP TV")
                    .publicationDate(LocalDateTime.now().minusDays(6))
                    .createdAt(LocalDateTime.now().minusDays(6))
                    .build()
            );

            articleRepository.saveAll(initialArticles);
            System.out.println(">>> [DataLoader] 8 articles officiels importés et publiés dans content_db avec succès !");
        }
    }
}
