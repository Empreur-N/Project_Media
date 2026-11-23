import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, BookOpen, User, Shield, PhoneCall, Radio, Smartphone, Zap, Clock, ShieldCheck, Mail } from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('readers');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const helpTopics = {
    readers: [
      {
        question: "Dois-je obligatoirement créer un compte pour consulter les actualités ou écouter la radio ?",
        answer: "Non, absolument pas ! Suivant le modèle des grands médias internationaux comme Africanews, LIFE CHANNEL garantit un accès 100% libre, anonyme et gratuit. Vous pouvez faire défiler l'ensemble des actualités, lire nos enquêtes intégrales, écouter la radio 24h/24, visionner les directs et consulter les podcasts sans aucune création de compte. L'inscription publique est totalement désactivée pour la sécurité de la plateforme."
      },
      {
        question: "Pourquoi n'y a-t-il aucun bouton de connexion ou d'inscription sur le site public ?",
        answer: "Conformément au standard éditorial d'Africanews et pour prévenir toute tentative d'intrusion par formulaire, la plateforme publique est entièrement dédiée à l'information des téléspectateurs et auditeurs. Aucun compte n'est nécessaire pour profiter de tous les flux d'information."
      },
      {
        question: "Comment les journalistes et l'équipe de rédaction se connectent-ils ?",
        answer: "Les agents accrédités disposent d'un portail réservé accessible via le lien 'Espace Rédaction' en pied de page (ou directement via l'adresse sécurisée /staff ou /admin/login). Une fois authentifié, l'agent retrouve sa console métier, sa cloche de notifications et ses outils de rédaction."
      },
      {
        question: "Comment écouter un podcast avec le lecteur persistant (Sticky Audio Player) ?",
        answer: "Rendez-vous sur l'onglet 'Podcasts' et cliquez sur le bouton de lecture d'une émission. Un lecteur audio haute qualité s'ancre automatiquement au bas de votre écran. Il reste actif pendant que vous parcourez les articles ou le site sans coupure."
      },
      {
        question: "Comment réagir à un article sans avoir de compte ?",
        answer: "Sous chaque article, un formulaire d'expression citoyenne vous permet de renseigner votre prénom ou pseudonyme et de partager votre avis. Les messages sont modérés avec bienveillance pour garantir la sérénité des échanges."
      }
    ],
    radio_eco: [
      {
        question: "Comment écouter la Radio en direct 24h/24 sans coupure ?",
        answer: "Cliquez sur le bouton 'Radio 24/7' dans la barre de navigation. Le flux audio sécurisé HTTPS (Icecast 2 / AzuraCast) est directement découplé des microservices pour vous garantir un streaming ultra-rapide et continu, même lors des pics d'audience."
      },
      {
        question: "Qu'est-ce que le « Mode Éco » et comment réduit-il la consommation internet en RDC ?",
        answer: "Le Mode Éco (activable via le bouton 'MODE ÉCO' dans la barre de menu) adapte dynamiquement l'interface pour les connexions à bande passante limitée : chargement d'images légères et optimisées, arrêt des préchargements volumineux et streaming audio à faible débit, économisant votre forfait data mobile."
      },
      {
        question: "Comment fonctionne l'affichage bivalent des fuseaux horaires (Kinshasa WAT / Lubumbashi CAT) ?",
        answer: "La RDC traverse deux fuseaux horaires : Kinshasa/Ouest (GMT+1 - WAT) et Lubumbashi/Est (GMT+2 - CAT). Cliquez sur l'indicateur horaire dans la barre de navigation pour basculer à tout moment entre ces deux fuseaux. Toutes les dates et heures de publication s'ajustent instantanément à votre région."
      }
    ],
    payments: [
      {
        question: "Quels opérateurs Mobile Money sont acceptés pour la régie publicitaire ?",
        answer: "Notre plateforme intègre les trois opérateurs leaders de République Démocratique du Congo : Vodacom M-Pesa, Airtel Money et Orange Money. Les paiements peuvent s'effectuer en Dollars américains (USD) ou en Francs Congolais (CDF)."
      },
      {
        question: "Comment se déroule la validation d'un paiement publicitaire ?",
        answer: "Après avoir configuré votre campagne (emplacement Header, Sidebar ou Footer), vous choisissez votre opérateur Mobile Money et saisissez votre numéro de téléphone. Une demande push sécurisée est transmise sur votre mobile. Dès saisie de votre code PIN secret et confirmation par Webhook, votre bannière est automatiquement activée sur le portail."
      },
      {
        question: "Comment suivre les statistiques d'affichage (Impressions & Clics) de mes bannières ?",
        answer: "La régie publicitaire calcule automatiquement le nombre d'impressions uniques et le taux de clic (CTR) pour chaque encart publicitaire. Ces métriques sont consultables en temps réel dans l'espace administration publicitaire."
      }
    ],
    journalists: [
      {
        question: "Comment rédiger et programmer la publication d'un article ?",
        answer: "Dans l'Espace Journaliste ('Rédiger un article'), remplissez les champs obligatoires (Titre, Contenu, Catégorie, Région). Vous pouvez programmer une diffusion à l'avance en sélectionnant votre date et votre fuseau de référence (Kinshasa WAT ou Lubumbashi CAT). Le système convertit automatiquement l'heure en UTC avant de la sauvegarder."
      },
      {
        question: "Comment associer une image de couverture ou un enregistrement MP3 ?",
        answer: "Dans le formulaire de rédaction ou dans 'Mes Podcasts', sélectionnez votre fichier image ou audio. Le système génère automatiquement un aperçu haute définition redimensionné avec antialiasing et le stocke sur notre serveur de stockage média."
      },
      {
        question: "Que faire si mon article est marqué 'REVISION_REQUIRED' (corrections demandées) ?",
        answer: "Le Rédacteur en Chef a obligatoirement renseigné le motif exact du rejet dans le registre d'audit. Consultez la notification, modifiez les points indiqués dans votre espace de rédaction, puis soumettez à nouveau l'article pour validation."
      }
    ],
    editors: [
      {
        question: "Comment déclencher une alerte urgente (« Breaking News ») en temps réel ?",
        answer: "Dans l'Espace Rédacteur en Chef, cliquez sur 'Diffuser une Alerte Info (Breaking News)'. Saisissez le titre et le texte d'urgence. Grâce au protocole Server-Sent Events (SSE), un bandeau rouge clignotant s'affiche instantanément sur tous les écrans connectés, sans forcer les milliers d'utilisateurs à actualiser manuellement."
      },
      {
        question: "Qu'est-ce que le Registre d'Audit Légal (Article 49) et comment le consulter ?",
        answer: "Conformément à la réglementation sur la presse numérique en RDC, chaque action éditoriale (création, modification de titre ou de texte, publication, refus motivé) est enregistrée de façon inaltérable dans la table article_audit_logs avec l'horodatage UTC, l'adresse IP et l'identité du rédacteur. Cliquez sur 'Registre d'Audit Légal' dans l'Espace Rédacteur en Chef pour consulter cet historique officiel."
      },
      {
        question: "Comment fonctionne la modération des commentaires ?",
        answer: "Les commentaires ayant atteint 5 signalements sont automatiquement suspendus de l'affichage public. Dans 'Console' > 'Modération', vous pouvez soit lever le signalement pour réhabiliter le commentaire, soit le supprimer définitivement pour protéger l'espace public."
      }
    ]
  };

  // Filter topics based on search query
  const getFilteredTopics = () => {
    const allTopics = [
      ...helpTopics.readers.map(t => ({ ...t, cat: 'readers', label: 'Lecteurs & Podcasts' })),
      ...helpTopics.radio_eco.map(t => ({ ...t, cat: 'radio_eco', label: 'Radio & Mode Éco' })),
      ...helpTopics.payments.map(t => ({ ...t, cat: 'payments', label: 'Mobile Money & Pubs' })),
      ...helpTopics.journalists.map(t => ({ ...t, cat: 'journalists', label: 'Journalistes' })),
      ...helpTopics.editors.map(t => ({ ...t, cat: 'editors', label: 'Rédaction & Audit' }))
    ];

    if (!searchQuery.trim()) {
      return helpTopics[activeTab].map(t => ({ ...t, cat: activeTab }));
    }

    return allTopics.filter(t => 
      t.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredTopics = getFilteredTopics();

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <HelpCircle size={32} style={{ color: 'var(--secondary)' }} />
        </div>
        <h1 style={styles.title}>FAQ • Foire Aux Questions & Centre d'Aide</h1>
        <p style={styles.subtitle}>
          Toutes les réponses à vos questions sur les services LIFE CHANNEL, la radio en direct, le mode éco RDC, les paiements Mobile Money et l'espace rédactionnel.
        </p>
      </div>

      {/* Search Help */}
      <div className="glass-card" style={styles.searchCard}>
        <div style={styles.searchWrapper}>
          <Search size={20} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher une question : radio 24/7, mode éco, mobile money, déconnexion, fuseaux..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Tabs (Only show if not searching) */}
      {!searchQuery.trim() && (
        <div style={styles.tabs}>
          <button 
            onClick={() => { setActiveTab('readers'); setExpandedFaq(null); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'readers' ? styles.activeTab : {}) }}
          >
            <BookOpen size={16} /> Lecteurs & Podcasts
          </button>
          <button 
            onClick={() => { setActiveTab('radio_eco'); setExpandedFaq(null); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'radio_eco' ? styles.activeTab : {}) }}
          >
            <Radio size={16} /> Radio 24/7 & Mode Éco
          </button>
          <button 
            onClick={() => { setActiveTab('payments'); setExpandedFaq(null); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'payments' ? styles.activeTab : {}) }}
          >
            <Smartphone size={16} /> Mobile Money & Pubs
          </button>
          <button 
            onClick={() => { setActiveTab('journalists'); setExpandedFaq(null); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'journalists' ? styles.activeTab : {}) }}
          >
            <User size={16} /> Journalistes
          </button>
          <button 
            onClick={() => { setActiveTab('editors'); setExpandedFaq(null); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'editors' ? styles.activeTab : {}) }}
          >
            <ShieldCheck size={16} /> Rédaction & Audit
          </button>
        </div>
      )}

      {/* FAQ List */}
      <div style={styles.faqList}>
        {searchQuery.trim() && (
          <p style={styles.searchResultsTitle}>
            Résultats de recherche pour "{searchQuery}" ({filteredTopics.length})
          </p>
        )}
        
        {filteredTopics.length === 0 ? (
          <div className="glass-card" style={styles.emptyState}>
            <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucune rubrique FAQ ne correspond à votre recherche.</p>
          </div>
        ) : (
          filteredTopics.map((topic, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div 
                key={index} 
                className="glass-card" 
                style={{ ...styles.faqCard, ...(isExpanded ? styles.expandedFaqCard : {}) }}
              >
                <div onClick={() => toggleFaq(index)} style={styles.faqHeader}>
                  <div style={styles.faqTitleWrapper}>
                    {searchQuery.trim() && (
                      <span style={styles.categoryBadge}>{topic.label}</span>
                    )}
                    <h3 style={styles.faqQuestion}>{topic.question}</h3>
                  </div>
                  {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                </div>
                {isExpanded && (
                  <div style={styles.faqAnswer}>
                    <p>{topic.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Additional Assistance Block */}
      <div className="glass-card" style={styles.assistanceBlock}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={styles.iconCircle}>
            <PhoneCall size={22} style={{ color: 'var(--secondary)' }} />
          </div>
          <div style={styles.iconCircle}>
            <Mail size={22} style={{ color: 'var(--secondary)' }} />
          </div>
        </div>

        <h3 style={styles.assistanceTitle}>Vous n'avez pas trouvé votre réponse ?</h3>
        <p style={styles.assistanceSubtitle}>
          Notre équipe technique, la direction et le secrétariat de rédaction de LIFE CHANNEL sont à votre disposition pour vous répondre directement :
        </p>

        {/* Contact Channels Row */}
        <div style={styles.contactRow}>
          <a href="tel:+243979208109" style={styles.contactCard} title="Appeler la ligne RDC & WhatsApp">
            <div style={styles.contactIconWrap}>
              <PhoneCall size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={styles.contactLabel}>Ligne RDC & WhatsApp</span>
              <strong style={styles.contactValue}>+243 979 208 109</strong>
            </div>
          </a>

          <a href="tel:+14033621837" style={styles.contactCard} title="Appeler la ligne Internationale / Amérique">
            <div style={styles.contactIconWrap}>
              <PhoneCall size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={styles.contactLabel}>Ligne Internationale & Amérique</span>
              <strong style={styles.contactValue}>+1 403 362-1837</strong>
            </div>
          </a>

          <a href="mailto:lifechannelactualites@gmail.com" style={styles.contactCard} title="Envoyer un e-mail à la rédaction">
            <div style={styles.contactIconWrap}>
              <Mail size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={styles.contactLabel}>Email Rédaction & Actualités</span>
              <strong style={styles.contactValue}>lifechannelactualites@gmail.com</strong>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '36px 24px 80px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '920px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconWrapper: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'rgba(245, 158, 11, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '14px',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '620px',
    lineHeight: '1.6',
  },
  searchCard: {
    padding: '14px 20px',
    marginBottom: '24px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '0',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    padding: '10px 10px 10px 32px',
    fontSize: '15px',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    flex: '1 1 160px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '25px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    background: 'linear-gradient(135deg, rgba(107, 79, 56, 0.4) 0%, rgba(216, 180, 254, 0.15) 100%)',
    borderColor: 'var(--primary)',
    color: '#fff',
    boxShadow: '0 0 15px rgba(216, 180, 254, 0.25)',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '40px',
  },
  faqCard: {
    padding: '18px 22px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '12px',
  },
  expandedFaqCard: {
    borderColor: 'rgba(216, 180, 254, 0.45)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(216, 180, 254, 0.12)',
  },
  faqHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
  },
  faqTitleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
  },
  categoryBadge: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  faqQuestion: {
    fontSize: '15px',
    fontWeight: '600',
    margin: 0,
    color: 'var(--text-main)',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  faqAnswer: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.65',
    textAlign: 'left',
  },
  searchResultsTitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
  },
  assistanceBlock: {
    padding: '36px 24px',
    textAlign: 'center',
    border: '1px solid rgba(216, 180, 254, 0.25)',
    borderRadius: '16px',
    background: 'linear-gradient(180deg, rgba(30, 22, 20, 0.6) 0%, rgba(18, 13, 11, 0.9) 100%)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
  },
  iconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(216, 180, 254, 0.12)',
    border: '1px solid rgba(216, 180, 254, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistanceTitle: {
    fontSize: '20px',
    fontFamily: 'var(--font-luxury), Playfair Display, serif',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '0.02em',
  },
  assistanceSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    maxWidth: '560px',
    margin: '0 auto 24px',
    lineHeight: '1.6',
  },
  contactRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '14px',
    marginBottom: '10px',
  },
  contactCard: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(216, 180, 254, 0.22)',
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.25s ease',
  },
  contactIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(216, 180, 254, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary)',
    flexShrink: 0,
  },
  contactLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  contactValue: {
    display: 'block',
    fontSize: '15px',
    letterSpacing: '0.03em',
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: '1.4',
  },
  supportLink: {
    color: 'var(--secondary)',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '8px',
    background: 'rgba(216, 180, 254, 0.08)',
    border: '1px solid rgba(216, 180, 254, 0.15)',
    transition: 'all 0.2s ease',
  }
};

export default Help;
