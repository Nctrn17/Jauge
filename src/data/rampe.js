// La rampe des douze mois : janvier au plus clair, décembre au plus foncé.
// Partagée entre les barres de fond et les boutons de mois, pour qu'un mois
// coché ait exactement la couleur de la barre qu'il allume.

export const RAMPE_MOIS = [
  '#F0DED3', '#E9C9BE', '#E0B2A8', '#D69A92',
  '#C9827C', '#B96A68', '#A65458', '#8F3F4C',
  '#752D41', '#5A1F36', '#3E152A', '#2A1420',
]

export const MOIS_ETEINT = '#EFE6DD'

export const couleurMois = (mois) => RAMPE_MOIS[(mois - 1) % 12]

// À partir du 7e ton, le fond est assez sombre pour porter du texte crème.
export const encreSurMois = (mois) => ((mois - 1) % 12 >= 6 ? '#F6F1E8' : '#2A1420')
