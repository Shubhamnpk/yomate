// Curriculum data extracted from the official CTEVT Diploma in Pharmacy (Second Revision, 2021)

export interface SubUnit {
  id: string;
  label: string;
  text: string;
  details?: string[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  hours: number;
  marks: number;
  subUnits: SubUnit[];
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  theoryHours: number;
  practicalHours: number;
  totalHours: number;
  creditHours: number;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  description: string;
  objectives: string[];
  units: Unit[];
  practicals?: string[];
  references: string[];
}

export interface YearData {
  year: number;
  subjects: Subject[];
}

export const secondYearData: YearData = {
  "year": 2,
  "subjects": [
    {
      "id": "pharmaceutics-1",
      "name": "Pharmaceutics - I",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to equip the students with knowledge and skills on the pharmaceutical development, pharmaceutical calculations, pharmaceutical process, and principles of pharmaceutics and basics of biopharmaceutics. It deals with various unit operations used in Pharmaceutical industries and factors affecting bioavailability.",
      "objectives": [
        "Classify different pharmaceutical dosage forms and orient with new drug delivery systems.",
        "Describe the contents of different pharmacopoeias.",
        "Define metrology, do conversion from one system to another and solve the problems related to percentage and ratio strength and dilution and concentration.",
        "Define comminution and describe comminution principles with example of each.",
        "Describe different grades of powder.",
        "Describe the pharmaceutical application of size separation and mixing and working of their respective equipment.",
        "Select filters and describe the different filtration equipment.",
        "Describe the pharmaceutical application of drying and explain different dryers.",
        "Describe the physicochemical principles of pharmaceutics and their applications, and",
        "Prepare simple Pharmaceutical preparations."
      ],
      "units": [
        {
          "id": "pharmaceutics-1-u1",
          "unitNumber": 1,
          "title": "Introduction to pharmaceutical development and dosage forms",
          "hours": 15,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u1-sub-1",
              "label": "a",
              "text": "Historical background and development of profession of pharmacy: Describe history of pharmacy profession in Nepal in relation to pharmacy education, industry and organization."
            },
            {
              "id": "pharmaceutics-1-u1-sub-2",
              "label": "b",
              "text": "Dosage forms: Introduction to dosage forms, definition with example.",
              "details": [
                "Solid dosage forms: Tablets, Capsules, Powders, Granules, Suppositories, Lozenges",
                "Liquid dosage forms: Solution, Syrups , Elixirs, Emulsions, Suspensions, Liniments, Injections, Tinctures",
                "Semisolid dosage forms: Ointments, Creams, Paste, Gels",
                "Gases dosage forms: Aerosol, Inhalants"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u2",
          "unitNumber": 2,
          "title": "Pharmacopoeias and Formularies used in Nepal",
          "hours": 10,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u2-sub-1",
              "label": "a",
              "text": "Define Pharmacopoeias, Formularies (NNF) and Compendia"
            },
            {
              "id": "pharmaceutics-1-u2-sub-2",
              "label": "b",
              "text": "Contents of Monograph"
            },
            {
              "id": "pharmaceutics-1-u2-sub-3",
              "label": "c",
              "text": "Introduce to different official Compendia like British Pharmacopoeia, European Pharmacopoeia, International Pharmacopoeia, United States Pharmacopoeia, Indian Pharmacopoeia, Japanese Pharmacopoeia, British Pharmaceutical Codex"
            },
            {
              "id": "pharmaceutics-1-u2-sub-4",
              "label": "d",
              "text": "List of recognized pharmacopoeia in Nepal."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u3",
          "unitNumber": 3,
          "title": "Unit operations",
          "hours": 35,
          "marks": 20,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u3-sub-1",
              "label": "",
              "text": "Definition, objectives/applications, principles, construction and workings of:"
            },
            {
              "id": "pharmaceutics-1-u3-sub-2",
              "label": "a",
              "text": "Milling: Factors affecting size reduction process , Hammer mill, Ball mill, and Colloidal Mill [10 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u3-sub-3",
              "label": "b",
              "text": "Size Separation: Classification powder according to pharmacopoeia, Cyclone separator, Sieves and standards of sieves [6 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u3-sub-4",
              "label": "c",
              "text": "Mixing and Homogenization: Double cone blender, Triple roller mill and Silverson mixer homogenizer. [6 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u3-sub-5",
              "label": "d",
              "text": "Filtration: Theory of filtration, factors a ffecting filtration, membrane filter and sintered glass filter. [6 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u3-sub-6",
              "label": "e",
              "text": "Drying process: factors affecting drying, Tray dryer, fluidized bed dryer and freeze dryer. [7 Hrs.]"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u4",
          "unitNumber": 4,
          "title": "Heat Process",
          "hours": 7,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u4-sub-1",
              "label": "a",
              "text": "Define and differentiate heat and temperature."
            },
            {
              "id": "pharmaceutics-1-u4-sub-2",
              "label": "b",
              "text": "Define heat transfer and describe different methods of heat transfer."
            },
            {
              "id": "pharmaceutics-1-u4-sub-3",
              "label": "c",
              "text": "Define evaporation and explain its pharmaceutical application."
            },
            {
              "id": "pharmaceutics-1-u4-sub-4",
              "label": "d",
              "text": "Describe evaporation pan and evaporating still."
            },
            {
              "id": "pharmaceutics-1-u4-sub-5",
              "label": "e",
              "text": "Describe different factors affecting evaporation."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u5",
          "unitNumber": 5,
          "title": "Distillation",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u5-sub-1",
              "label": "",
              "text": "Distillation: Discuss basic Principle and applications of simple distillation, steam distillation, Azeotropic distillation, vacuum distillation, fractional distillation, & molecular distillation."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u6",
          "unitNumber": 6,
          "title": "Physicochemical Principles of Pharmaceutics",
          "hours": 30,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u6-sub-1",
              "label": "a",
              "text": "pH, buffers and Isotonic solutions: Sorensen’s pH scale, applications of buffers, buffer equation, buffer capacity. [5 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u6-sub-2",
              "label": "b",
              "text": "Rheology and flow of fluids. Define viscosity and rheology and classify fluids based on its flow property. Determine viscosity by the help of capillary viscometer. Define Newtonian and Non-Newtonian fluid along with different types of Non-Newtonian Fluids. Describe Pharmaceutical application of rheology. [10 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u6-sub-3",
              "label": "c",
              "text": "Surface and Interfacial Phenomena. Define surface and Interfacial tension and Describe methods of measurement of surface tension (Capillary method and Drop method). Describe contact angle and its pharmaceutical applications. Describe surfactants, their Classification with examples and their pharmaceutical applications. [5 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u6-sub-4",
              "label": "d",
              "text": "Disperse system: Define colloids. Discuss classification and application of colloids in pharmacy. [2 Hrs.]"
            },
            {
              "id": "pharmaceutics-1-u6-sub-5",
              "label": "e",
              "text": "Kinetics and stability testing: Introduction to rate of reaction and significance of reaction kinetics. Define different order of reactions (zero and first). Describe different methods for determination of order of reactions (graphical method). Stability of pharmaceutical products (ICH guidelines) and factors affecting stability. [8 Hrs.]"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u7",
          "unitNumber": 7,
          "title": "Monophasic liquid dosage forms",
          "hours": 10,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u7-sub-1",
              "label": "a",
              "text": "Define monophasic liquid dosage forms and mention its advantages and disadvantages."
            },
            {
              "id": "pharmaceutics-1-u7-sub-2",
              "label": "b",
              "text": "Define solubility and factors affecting solubility."
            },
            {
              "id": "pharmaceutics-1-u7-sub-3",
              "label": "c",
              "text": "Formulations of monophasic liquid dosage forms."
            },
            {
              "id": "pharmaceutics-1-u7-sub-4",
              "label": "d",
              "text": "Describe the preparation of Syrups, Elixirs, Lotions and Liniments."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u8",
          "unitNumber": 8,
          "title": "Introduction to Biopharmaceutics",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u8-sub-1",
              "label": "a",
              "text": "Define Biopharmaceutics, its importance and introduction to Biopharmaceutics system of classification of drugs."
            },
            {
              "id": "pharmaceutics-1-u8-sub-2",
              "label": "b",
              "text": "Describe basic concept of mechanism of drug transport across gastrointestinal barrier."
            },
            {
              "id": "pharmaceutics-1-u8-sub-3",
              "label": "c",
              "text": "Define bioavailability and Bioequivalence. Describe differ ent factors affecting bioavailability."
            },
            {
              "id": "pharmaceutics-1-u8-sub-4",
              "label": "d",
              "text": "Describe absolute and relative bioavailability."
            },
            {
              "id": "pharmaceutics-1-u8-sub-5",
              "label": "e",
              "text": "Describe plasma concentration time curve of oral, IV bolus and IV infusion."
            },
            {
              "id": "pharmaceutics-1-u8-sub-6",
              "label": "f",
              "text": "Introduce different terms Volume of Distribution, Half-life, Steady state concentration, Clearance, Loading dose, Maintenance dose, and Elimination rate constant."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-1-u9",
          "unitNumber": 9,
          "title": "Weight and measures",
          "hours": 5,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-1-u9-sub-1",
              "label": "a",
              "text": "Classify weight and measure and convert from one system to another and one unit to another."
            },
            {
              "id": "pharmaceutics-1-u9-sub-2",
              "label": "b",
              "text": "Solve problems related to percentage and ratio strength, allegation method and isotonic solutions"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Different pharmaceutical preparations and dosage forms a. Prepare and supply chloroform water. b. Prepare and supply aqueous iodine solution. c. Prepare and supply chloroform spirit. d. Prepare and supply camphor spirit. e. Prepare and supply strong ginger tincture. f. Prepare and supply orange/iodine tincture. g. Prepare and supply root extract of Rheum emodi (Padamchal). h. Prepare and supply extract of Mentha species (Pudina). i. Prepare and supply thymol/chlorhexidine gargle. j. Prepare and supply calamine lotion. k. Prepare and supply compound sodium chloride mouthwash. l. Prepare simple syrup.",
        "Physicochemical principles of pharmaceutics a. Determine surface tension using drop count method. b. Determine bulk density and void porosity of given powder. c. Measure the viscosity of simple syrup using Ostwald viscometer d. Perform the mixing of different colored powders and examine their particle size microscopically. e. Carry out simple filtration experiment f. Carry out simple experiment to measure moisture content in given powder material.",
        "Biopharmaceutics a. Construct plasma drug concentration time profile from given data using normal and semi log graph. b. Calculate absolute and relative bioavailability from given data c. Calculate loading and maintenance dose d. Calculate half-life, Volume of distribution, Elimination rate constant and clearance from given data through IV bolus."
      ],
      "references": [
        "Gaud. Pharmaceutics, 2003, India.",
        "Gaud and Gupta. Practical Pharmaceutics, 2004, India.",
        "Gaud and Gupta. Practical Physical Pharmacy, 2004, India.",
        "Gaud. Textbook of pharmaceutics, 2004, India.",
        "Gupta, A. K. Pharmaceutics: Practical manual",
        "Gupta, A. K. Introduction to pharmaceutics-I. , 2004, CBS publisher and distributors,",
        "India. Thapa, P, Thapa, B. B. and Budhathoki, U. (2006), Introductory Pharmaceutics volume",
        "The extra pharmacopoeia",
        "Physical Pharmacy by Alfred Martin.",
        "Bentley’s Text Book of Pharmaceutics by E. A. Rawlins.",
        "Remington: The Science and Practice of Pharmacy, 20th Edition, Vol I & II."
      ]
    },
    {
      "id": "pharmacology-1",
      "name": "Pharmacology I",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "The main purpose of the subject is to understand what drugs do to the living organisms and how their effects can be applied to therapeutics. The subject covers the information about the drugs like, mechanism of action, physiological and biochemical effects (Pharmacodynamics) as well as absorption, distribution, metabolism and excretion (pharmacokinetics) along with the adverse effects, clinical uses, interactions, doses, contraindications and routes of administration of different classes of drugs.",
      "objectives": [
        "Discuss the Classification, pharmacological actions of different categories of drugs",
        "Discuss the mechanism of drug action at organ system/sub cellular/ macromolecular levels.",
        "Discuss indication, contraindication and adverse effects of different categories of drugs",
        "Apply the basic pharmacological knowledge in the prevention and treatment of various diseases."
      ],
      "units": [
        {
          "id": "pharmacology-1-u1",
          "unitNumber": 1,
          "title": "General Pharmacology",
          "hours": 25,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmacology-1-u1-sub-1",
              "label": "a",
              "text": "Introduction and basic terminologies of pharmacology."
            },
            {
              "id": "pharmacology-1-u1-sub-2",
              "label": "b",
              "text": "Discuss nomenclature and sources of drugs."
            },
            {
              "id": "pharmacology-1-u1-sub-3",
              "label": "c",
              "text": "Discuss different routes of drug administration with their advantages and disadvantages."
            },
            {
              "id": "pharmacology-1-u1-sub-4",
              "label": "d",
              "text": "Define pharmacokinetic and pharmacodynamic."
            },
            {
              "id": "pharmacology-1-u1-sub-5",
              "label": "e",
              "text": "Describe process of absorption, distribution, metabolism and excretion and various factors influencing them."
            },
            {
              "id": "pharmacology-1-u1-sub-6",
              "label": "f",
              "text": "Discuss principles and mechanisms of drug action."
            },
            {
              "id": "pharmacology-1-u1-sub-7",
              "label": "g",
              "text": "Describe various factors affecting drug action."
            },
            {
              "id": "pharmacology-1-u1-sub-8",
              "label": "h",
              "text": "Discuss dose-response relationship."
            },
            {
              "id": "pharmacology-1-u1-sub-9",
              "label": "i",
              "text": "Define LD50, ED50 and Therapeutic index, safety, potency, efficacy, toxicity."
            },
            {
              "id": "pharmacology-1-u1-sub-10",
              "label": "j",
              "text": "Discuss theories and classification of receptors."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-1-u2",
          "unitNumber": 2,
          "title": "Gastrointestinal Drugs",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmacology-1-u2-sub-1",
              "label": "2.1",
              "text": "Classify the drugs used in Peptic ulcer, vomiting, diarrhea, and constipation."
            },
            {
              "id": "pharmacology-1-u2-sub-2",
              "label": "2.2",
              "text": "Describe general mechanism of action, indications, side effects/ ADR, cont raindications, precautions and doses of"
            },
            {
              "id": "pharmacology-1-u2-sub-3",
              "label": "a",
              "text": "Drugs used in Peptic ulcer: Aluminiumhydroxide, Magnesium hydroxide, sodium bicarbonate, ranitidine, Omeprazole, sucralfate."
            },
            {
              "id": "pharmacology-1-u2-sub-4",
              "label": "b",
              "text": "Antiemetic drugs: Domperidone, Ondensetron, promethazine"
            },
            {
              "id": "pharmacology-1-u2-sub-5",
              "label": "c",
              "text": "Antidiarrheal: Loperamide, ORS"
            },
            {
              "id": "pharmacology-1-u2-sub-6",
              "label": "d",
              "text": "Drug used in constipation: Isapgol husk, Bisacodyl, Castor oil, Lactulose"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-1-u3",
          "unitNumber": 3,
          "title": "NSAID’s and Antipyretic Analgesics",
          "hours": 15,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmacology-1-u3-sub-1",
              "label": "3.1",
              "text": "Define pain, pyrexia, inflammation, analgesics, antipyretics and anti-inflammatory agents."
            },
            {
              "id": "pharmacology-1-u3-sub-2",
              "label": "3.2",
              "text": "Discuss pharmacological classification of NSAID’s"
            },
            {
              "id": "pharmacology-1-u3-sub-3",
              "label": "a",
              "text": "General mechanism of action, indications, side effects/ADR, contraindications, precautions and dose of : Ibuprofen, Indomethacin, Mefenamic acid, Diclofenac, paracetamol, Aspirin, Etoricoxib, Ketorolac"
            },
            {
              "id": "pharmacology-1-u3-sub-4",
              "label": "b",
              "text": "Classify drugs used in gout and rheumatoid arthritis."
            },
            {
              "id": "pharmacology-1-u3-sub-5",
              "label": "c",
              "text": "General mechanism of action, indications, side effects/ADR, contraindications, precautions and dose of Colchicine, Allopurinol, Febuxostat, gold Compound, Methotrexate , Methylprednisolone"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-1-u4",
          "unitNumber": 4,
          "title": "Drugs acting on Autonomic Nervous System",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmacology-1-u4-sub-1",
              "label": "4.1",
              "text": "Discuss Physiology of ANS"
            },
            {
              "id": "pharmacology-1-u4-sub-2",
              "label": "4.2",
              "text": "Discuss classification, General mechanism of action, pharmacological actions, indications, side effects/ADR, contraindications, precautions and dose of"
            },
            {
              "id": "pharmacology-1-u4-sub-3",
              "label": "a",
              "text": "Cholinergic drugs: Pilocarpine, Neostigmine, Pyridostigmine"
            },
            {
              "id": "pharmacology-1-u4-sub-4",
              "label": "b",
              "text": "Anticholinergic drugs: Atropine, Hyoscine"
            },
            {
              "id": "pharmacology-1-u4-sub-5",
              "label": "c",
              "text": "Adrenergic drugs: Adrenaline, Noradrenaline, Dopamine"
            },
            {
              "id": "pharmacology-1-u4-sub-6",
              "label": "d",
              "text": "Antiadrenergic drugs: Doxazosin, Tamsulosin, Atenolol, Metoprolol"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-1-u5",
          "unitNumber": 5,
          "title": "Respiratory System Drugs",
          "hours": 10,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacology-1-u5-sub-1",
              "label": "5.1",
              "text": "Define cough, asthma, COPD."
            },
            {
              "id": "pharmacology-1-u5-sub-2",
              "label": "5.2",
              "text": "Classify drugs used in cough, asthma and COPD"
            },
            {
              "id": "pharmacology-1-u5-sub-3",
              "label": "5.3",
              "text": "Describe general mechanism of action, indications, side effects/ ADR, contraindications, precautions and doses of"
            },
            {
              "id": "pharmacology-1-u5-sub-4",
              "label": "a",
              "text": "Anti-tussives Codeine, Dextromethorphan"
            },
            {
              "id": "pharmacology-1-u5-sub-5",
              "label": "b",
              "text": "Expectorant: Ammonium Chloride, Bromohexine"
            },
            {
              "id": "pharmacology-1-u5-sub-6",
              "label": "c",
              "text": "Drugs used in asthma and COPD: Salbutamol, salmeterol, Aminophylline, Tiotropium bromide, Montelukast."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-1-u6",
          "unitNumber": 6,
          "title": "Antimicrobial",
          "hours": 50,
          "marks": 30,
          "subUnits": [
            {
              "id": "pharmacology-1-u6-sub-1",
              "label": "6.1",
              "text": "Classify antimicrobials according to their mechanism of action, spectrum of activity, type of action, type of organism against which the antibiotics are active."
            },
            {
              "id": "pharmacology-1-u6-sub-2",
              "label": "6.2",
              "text": "Discuss general principles of antimicrobial therapy."
            },
            {
              "id": "pharmacology-1-u6-sub-3",
              "label": "6.3",
              "text": "Discuss classifications, General mechanism of action, uses, side effects/ADR, contraindications, precautions and dose of"
            },
            {
              "id": "pharmacology-1-u6-sub-4",
              "label": "a",
              "text": "Sulphonamides: Co-trimoxazole, Silver sulfadiazine"
            },
            {
              "id": "pharmacology-1-u6-sub-5",
              "label": "b",
              "text": "Penicillin:Benzyl penicillin, Ampicillin, flucloxacillin,Amoxycillin, Pipericillin,Imepenam"
            },
            {
              "id": "pharmacology-1-u6-sub-6",
              "label": "c",
              "text": "Cephalosporin:Cephadroxil, cefexime, Cefotaxime, Cefpodoxime"
            },
            {
              "id": "pharmacology-1-u6-sub-7",
              "label": "d",
              "text": "Beta lactamase inhibitor:clavulanic acid, salbactum, tazobactum"
            },
            {
              "id": "pharmacology-1-u6-sub-8",
              "label": "e",
              "text": "Tetracycline: Tetracycline, Doxycycline"
            },
            {
              "id": "pharmacology-1-u6-sub-9",
              "label": "f",
              "text": "Aminoglycosides: Streptomycin, Gentamycin, Amikacin"
            },
            {
              "id": "pharmacology-1-u6-sub-10",
              "label": "g",
              "text": "Macrolides: Erythromycin, Azithromycin, Clarithromycin"
            },
            {
              "id": "pharmacology-1-u6-sub-11",
              "label": "h",
              "text": "Quinolones and fluoroquinolones:Nalidixic acid, Norfloxacin, ofloxacin"
            },
            {
              "id": "pharmacology-1-u6-sub-12",
              "label": "i",
              "text": "Antitubercular drugs:",
              "details": [
                "First line: INH, Rifampicin, Pyrazinamide, Ethambutol",
                "Second line: PAS, Cycloserine, Ciprofloxacin"
              ]
            },
            {
              "id": "pharmacology-1-u6-sub-13",
              "label": "j",
              "text": "Antileproticdrugs:Dapsone,clofazimine"
            },
            {
              "id": "pharmacology-1-u6-sub-14",
              "label": "k",
              "text": "Antifungal: Nystatin, Amphotericin B, Itraconazole, Clotrimazole, Ketoconazole, Fluconazole Luliconazole"
            },
            {
              "id": "pharmacology-1-u6-sub-15",
              "label": "l",
              "text": "Antiviral: Acyclovir Remdicivir, Zidovudine, Lamivudine, tenofovir"
            },
            {
              "id": "pharmacology-1-u6-sub-16",
              "label": "m",
              "text": "Antimalarial: chloroquine, primaquine, quinine, artemisin and derivatives"
            },
            {
              "id": "pharmacology-1-u6-sub-17",
              "label": "n",
              "text": "Antiprotozoal: Metronidazole, Diloxanide Furoate, Tinidazole"
            },
            {
              "id": "pharmacology-1-u6-sub-18",
              "label": "o",
              "text": "Antihelmentics: Albendazole, Mebendazole, Diethylcarbamazine citrate"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Identify with the different instruments/ equipments of pharmacology laboratory in specimen/slide show/ pictures and diagrams",
        "Identify commonly used laboratory animals and their handling.",
        "Maintain laboratory animals as per CPCSEA guidelines.",
        "Demonstrate effect of cholinergic drugs on rabbit's eye.",
        "Demonstrate effect of anticholinergic drugs on rabbit's eye.",
        "Perform simulated data interpretation from existing data base",
        "Measure the temperature, pulse rate, respiratory rate and blood pressure in human volunteer.",
        "Conduct theory related case studies (minimum 10 case studies)",
        "Prepare drug profile of theory related commonly used drugs (minimum 20)"
      ],
      "references": [
        "Goodman G. A, Rall, T.W, Nies A.I.S, Taylor P. Goodman and Gilman’s The pharmacological Basis of therapeutics. McGraw Hill, Pergamon press.",
        "Craig, C.R, Stitzel R.E. Modern Pharmacology. Little Brown Co.",
        "Katzung B.G. Basic & Clinical Pharmacology. Churchill Livingstone New York",
        "Tripathi K. D. Essentials of medical pharmacology. Jaypee, Delhi.",
        "Rang H.P, Dale M.M. Pharmacology. Churchill Living stone.",
        "Satoskar R.S, Bhadarkar S.D. Pharmacology and pharmacotherapeutics. Popular, Dubai.",
        "Kulkarni S.K. Hand Book of Experimental Pharmacology. Vallabh Prakashan, Delhi.",
        "Grover J.K. Experiments in Pharmacy & Pharmacology. CBS Publishers, New Delhi."
      ]
    },
    {
      "id": "pharm-chem-1",
      "name": "Pharmaceutical Chemistry I",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to acquaint students with the knowledge and skills on inorganic part of Pharmaceutical and medicinal chemistry. This course focuses on the official literatures recommended by the Drug Control Authority, physico -chemical properties o f inorganic pharmaceutical ingredients and biological action in relation to their chemical structure and different methods of their quality control.",
      "objectives": [
        "Interpret the inorganic pharmaceutical ingredients, official monographs and articles.",
        "Describe the method of preparation, physico-chemical properties, method(s) of quality control, storage and medicinal and pharmaceutical use of various ingredients.",
        "Discuss Volumetric Analysis and solve numerical regarding volumetric analysis.",
        "Explain Column Chromatography."
      ],
      "units": [
        {
          "id": "pharm-chem-1-u1",
          "unitNumber": 1,
          "title": "Introduction",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharm-chem-1-u1-sub-1",
              "label": "1.1",
              "text": "Describe the importance of inorganic drug molecules as a whole and focus to pharmacy."
            },
            {
              "id": "pharm-chem-1-u1-sub-2",
              "label": "1.2",
              "text": "Discuss pharmacopoeia, official monograph and their importance."
            },
            {
              "id": "pharm-chem-1-u1-sub-3",
              "label": "1.3",
              "text": "Interpret one pharmacopoeial monograph as an example."
            },
            {
              "id": "pharm-chem-1-u1-sub-4",
              "label": "1.4",
              "text": "Describe the method of preparation, physico-chemical properties, storage, medicinal and pharmaceutical use of all ingredients mentioned below (Unit 2 to 7). Note: Detailed Monographs (molecular formula molecular weight method of preparation, physio-chemical properties, storage, and medicinal and pharmaceutical use) are only required for those substances with (*) sign. Substances other than (*) sign are required to deal with molecular formula, molecular weight, physical properties, storage and uses only."
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u2",
          "unitNumber": 2,
          "title": "Acids, Bases, Buffers, Antioxidants and Preservatives",
          "hours": 15,
          "marks": 9,
          "subUnits": [
            {
              "id": "pharm-chem-1-u2-sub-1",
              "label": "2.1",
              "text": "Acids and Bases: Concepts of acid and base (Arrhenius concept, Lewis concept, Bronsted Lowry concept), Boric acid*, Hydrochloric acid*, Strong ammonia solution, Calcium hydroxide*, Sodium hydroxide*."
            },
            {
              "id": "pharm-chem-1-u2-sub-2",
              "label": "2.2",
              "text": "Buffers: Buffer solution, buffer capacity, Selection and role of buffer in pharmacy, official buffers, Citric acid, Sodium citrate*, Sodium phosphate*"
            },
            {
              "id": "pharm-chem-1-u2-sub-3",
              "label": "2.3",
              "text": "Antioxidants and Preservatives: Introduction, classification of preservatives, Sodium benzoate*, Methyl parabens, Propylparabens, Sodium meta- bisulphite*, BHA and BHT*."
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u3",
          "unitNumber": 3,
          "title": "Gastrointestinal agents",
          "hours": 15,
          "marks": 9,
          "subUnits": [
            {
              "id": "pharm-chem-1-u3-sub-1",
              "label": "3.1",
              "text": "Acidifying agent: Dilute Hydrochloric acid."
            },
            {
              "id": "pharm-chem-1-u3-sub-2",
              "label": "3.2",
              "text": "Antacids: Introduction, Classification of antacids, Calcium Carbonate*, Aluminum hydroxide gel*, Magnesium Hydroxide,Magaldrate, Magnesium Trisilicate, Rational of combination antacids therapy."
            },
            {
              "id": "pharm-chem-1-u3-sub-3",
              "label": "3.3",
              "text": "Protective and adsorbents: Bismuth subsalicylate, Light Kaolin*,"
            },
            {
              "id": "pharm-chem-1-u3-sub-4",
              "label": "3.4",
              "text": "Laxative: Magnesium Sulphate*"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u4",
          "unitNumber": 4,
          "title": "Topical agents",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharm-chem-1-u4-sub-1",
              "label": "4.1",
              "text": "Protective: Talc*, Zinc Oxide*, Calamine*"
            },
            {
              "id": "pharm-chem-1-u4-sub-2",
              "label": "4.2",
              "text": "Anti-microbial agents: H2O2*, KMNO4*, Chlorinated lime*, Iodine* and its solution, Povidone iodine, Silver nitrate*, Yellow mercuric oxide,Sulphur compound: Precipitated sulphur and Selenium sulphide."
            },
            {
              "id": "pharm-chem-1-u4-sub-3",
              "label": "4.3",
              "text": "Astringents: Alum, Zinc sulphate*"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u5",
          "unitNumber": 5,
          "title": "Inorganic compounds used in dentistry",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharm-chem-1-u5-sub-1",
              "label": "5.1",
              "text": "Anti-caries agents: Sodium fluoride*, Stannous fluoride"
            },
            {
              "id": "pharm-chem-1-u5-sub-2",
              "label": "5.2",
              "text": "Dentifrices: Calcium carbonate, Dibasic calcium phosphate"
            },
            {
              "id": "pharm-chem-1-u5-sub-3",
              "label": "5.3",
              "text": "Desensitizing agents: Potassium nitrate* Strontium chloride*,"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u6",
          "unitNumber": 6,
          "title": "Miscellaneous agents",
          "hours": 8,
          "marks": 4,
          "subUnits": [
            {
              "id": "pharm-chem-1-u6-sub-1",
              "label": "6.1",
              "text": "Inhalants: Oxygen*, and Carbon dioxide*"
            },
            {
              "id": "pharm-chem-1-u6-sub-2",
              "label": "6.2",
              "text": "Expectorants: Ammonium chloride* and Potassium iodide"
            },
            {
              "id": "pharm-chem-1-u6-sub-3",
              "label": "6.3",
              "text": "Antidotes: Sodium nitrite* Activated Charcoal*"
            },
            {
              "id": "pharm-chem-1-u6-sub-4",
              "label": "6.4",
              "text": "Hematinics: Ferrous Fumarate*"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u7",
          "unitNumber": 7,
          "title": "Major intra and extra cellular electrolytes",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharm-chem-1-u7-sub-1",
              "label": "7.1",
              "text": "Physiological role of major electrolytes: Chloride, Phosphate, Bicarbonate, Sodium, Potassium, Calcium and Magnesium"
            },
            {
              "id": "pharm-chem-1-u7-sub-2",
              "label": "7.2",
              "text": "Electrolytes used in replacement therapy: Sodium chloride*, Potassium chloride and Calcium gluconate"
            },
            {
              "id": "pharm-chem-1-u7-sub-3",
              "label": "7.3",
              "text": "Physiological acid-base balance and electrolytes used: Sodium acetate, Potassium acetate*, Sodium bicarbonate*, Potassium citrate"
            },
            {
              "id": "pharm-chem-1-u7-sub-4",
              "label": "7.4",
              "text": "Electrolyte combination therapy: Ringer Lactate solution, Oral rehydration salts"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u8",
          "unitNumber": 8,
          "title": "Radiopharmaceuticals and radio-opaque contrast media",
          "hours": 5,
          "marks": 3,
          "subUnits": [
            {
              "id": "pharm-chem-1-u8-sub-1",
              "label": "8.1",
              "text": "Radioactivity, Properties of Alpha, Beta and Gama Radiations, measurement of radioactivity, GM Counter."
            },
            {
              "id": "pharm-chem-1-u8-sub-2",
              "label": "8.2",
              "text": "Definition of Radiopharmaceuticals, Applications of Radio Isotopes of Iodine131, Gold198, Technetium 99 m and Calcium 47"
            },
            {
              "id": "pharm-chem-1-u8-sub-3",
              "label": "8.3",
              "text": "Contrast Media: Barium Sulphate"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u9",
          "unitNumber": 9,
          "title": "Quality Control of Inorganic active pharmaceutical ingredients",
          "hours": 40,
          "marks": 23,
          "subUnits": [
            {
              "id": "pharm-chem-1-u9-sub-1",
              "label": "9.1",
              "text": "Define Quality control and Quality assurance, importance of quality control [2 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-2",
              "label": "9.2",
              "text": "Describe sources of impurities in pharmaceutical ingredients and Tests of purity [2 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-3",
              "label": "9.3",
              "text": "Limit Test: Definition, importance, Discuss Principle and procedure for limit tests for chloride, sulphate, iron and heavy metals as per pharmacopeias. [8 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-4",
              "label": "9.4",
              "text": "Identification tests for ions and radicals: Definition, Explain qualitative identification tests for common Cations (Al, Ca, Mg, Zn, Fe, Ag, Na, K) and Anions (Halides, Phosphate, Sulphate, Bicarbonate, Carbonate, Nitrate). [6 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-5",
              "label": "9.5",
              "text": "Definition, method of determination and importance of melting point and boiling point. [4 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-6",
              "label": "9.6",
              "text": "Define errors, classification and minimization of errors, Precision and accuracy [4 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-7",
              "label": "9.7",
              "text": "Volumetric Analysis [15 Hrs.]"
            },
            {
              "id": "pharm-chem-1-u9-sub-8",
              "label": "a",
              "text": "Principle of Volumetric Analysis"
            },
            {
              "id": "pharm-chem-1-u9-sub-9",
              "label": "b",
              "text": "Concept of Equivalent weight",
              "details": [
                "Equivalent weight of acid, base and salts",
                "Gram equivalent weight"
              ]
            },
            {
              "id": "pharm-chem-1-u9-sub-10",
              "label": "c",
              "text": "Standard solution: Primary standard substances, Ideal requirements of primary standard substance, primary standard solution and secondary standard solution,"
            },
            {
              "id": "pharm-chem-1-u9-sub-11",
              "label": "d",
              "text": "Concentration of solutions, methods of expressing concentrations of solutions (molarity, normality, molality, gram per litre, percentage Parts per million), relation between normality, molarity and gram per litre."
            },
            {
              "id": "pharm-chem-1-u9-sub-12",
              "label": "e",
              "text": "Related numerical"
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u10",
          "unitNumber": 10,
          "title": "Titration",
          "hours": 25,
          "marks": 14,
          "subUnits": [
            {
              "id": "pharm-chem-1-u10-sub-1",
              "label": "a",
              "text": "Terminologies used in titrations (Titrant, titrand, indicator, end point, equivalent point, direct titration, indirect titration, back or residual titration, titration error)"
            },
            {
              "id": "pharm-chem-1-u10-sub-2",
              "label": "b",
              "text": "Acid-base titration",
              "details": [
                "Concept of acidimetry and alkalimetry",
                "Acid base indicators",
                "Selection of indicators in acid-base titration",
                "Acid base titrations (strong acid vs. strong base, weak acids-weak bases, weak acid vs. strong base and strong acid vs. weak acids) with pH curve",
                "Normality Factor (f)",
                "Introduce normality equation",
                "Numerical related to acid base titration."
              ]
            },
            {
              "id": "pharm-chem-1-u10-sub-3",
              "label": "c",
              "text": "Redox titration",
              "details": [
                "Concept of oxidation and reduction and types of redox titration (Principle and application of Iodometry and Iodimetry)"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-1-u11",
          "unitNumber": 11,
          "title": "Chromatography",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharm-chem-1-u11-sub-1",
              "label": "a",
              "text": "Definition, Terms used in chromatography, Introduce types of chromatography"
            },
            {
              "id": "pharm-chem-1-u11-sub-2",
              "label": "b",
              "text": "Column Chromatography: Discuss principle, column characteristics, Introduce stationary phase and mobile phase, preparation of column (Wet packing technique and dry packing technique), Sample introduction, elution technique (Isocratic and Gradient), Advantage and disadvantage, Application."
            },
            {
              "id": "pharm-chem-1-u11-sub-3",
              "label": "c",
              "text": "HPLC: Definition and application Pharmaceutical Chemistry I (Practical)"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Prepare monograph of given drug.",
        "Prepare inorganic compounds: Boric acid, Alum, Aluminum hydroxide gel, calcium carbonate, Sodium benzoate.",
        "Experiments on pharmacopoeial identification tests of cations and anions",
        "Carry out identification tests of the following Cations: Al, Ba, Bi, Ca, Mg, Mn, Cu, Zn, Fe, Ni, Ag, Na, K.",
        "Carry out identification tests of the following Anions: halides, phosphate, Sulphate, acetate, bicarbonate, carbonate and nitrate.",
        "Experiments on qualitative analysis of inorganic pharmaceuticals",
        "Determination of melting point of a sample by Thiel’s Tube / beaker method",
        "Determination of boiling point of a liquid by Thiel’s Tube / beaker method",
        "Experiments on limit tests",
        "Carry out the test for Chloride",
        "Carry out the test for Sulphate.",
        "Carry out the test for iron",
        "Experiments on reagent preparations, pH determination and volumetric analysis representing all methods of titrations",
        "Prepare necessary reagents- acid, alkali, salt solution and their standardization (percentage w/w, percentage w/v, Molarity, Molality, and Normality)",
        "Perform the experiment on the change in pH on the addition of strong acid and strong base in acidic, basic, neutral and buffered solution.",
        "Perform the titration of strong acid and strong base.",
        "Perform the titration of weak acid and strong base.",
        "Perform the titration of strong acid and weak base.",
        "Separation of different Plant pigments using Column Chromatography"
      ],
      "references": [
        "Mahadik KR and Kucher BS- Concise inorganic Pharmaceutical chemistry, Nirali Prakashan, 2004.",
        "Mahadik KR and Kucher BS- Concise organic Pharmaceutical chemistry, Nirali Prakashan, 2004.",
        "Kasture AV and Wadker- Pharmaceutical chemistry I & II NiraliPrakashan.",
        "Bekeet AH and Stenlk- Practical Pharmaceutical Chemistry 4th edition Part I & II.",
        "Kasture AV and Wadker- Practical Pharmaceutical chemistry I & II, NiraliPrakashan.",
        "Antheron LM-Bently’s& Drivers text book of Pharmaceutical chemistry, Oxford University Press London.",
        "Kadam et.al - Principles of Medicinal Chemistry Vol. I & II.",
        "Kasture AV et.al - Pharmaceutical analysis Vol I & II, NiraliPrakashan.",
        "Daniel C Harris- Quantitive Chemical Analysis, W H Freeman and Company.",
        "Jeffrey GH et.al-Vogel’s Textbook of Quantitative Chemical Analysis 5th Edition.",
        "Tipins HP Dhake AS- Inorganic Pharmaceutical chemistry, Career publication, 2002.",
        "Belsare P and Dhake AS- Inorganic Chemistry",
        "Indian Pharmacopoeia latest edition.",
        "British Pharmacopoeia latest edition."
      ]
    },
    {
      "id": "pharmacognosy",
      "name": "Pharmacognosy",
      "theoryHours": 3,
      "practicalHours": 2,
      "totalHours": 5,
      "creditHours": 4,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to equip with the knowledge of different classes of secondary metabolites derived from medicinal plants and their classification, phytochemical tests and medicinal uses. It also provides knowledge and skills to evaluate the quality of crude drugs and perform general extraction of secondary metabolites. Additionally, it imparts skills on producing the plants and phytochemicals through plant tissue culture and basic formulations of Ayurveda.",
      "objectives": [
        "Discuss the importance of Pharmacognosy",
        "Discuss the commercial processing and quality evaluation of crude drugs",
        "Define different types of secondary metabolites.",
        "Discuss the basic techniques of chromatography.",
        "Discuss the different techniques of extraction.",
        "Prepare herbarium and describe its significance",
        "Discuss pharmaceutical aids from natural sources.",
        "Discuss different Ayurvedic formulations.",
        "Discuss some Medicinal plants of Nepal having economic importance"
      ],
      "units": [
        {
          "id": "pharmacognosy-u1",
          "unitNumber": 1,
          "title": "Introduction to Pharmacognosy",
          "hours": 12,
          "marks": 8,
          "subUnits": [
            {
              "id": "pharmacognosy-u1-sub-1",
              "label": "a",
              "text": "Define Pharmacognosy."
            },
            {
              "id": "pharmacognosy-u1-sub-2",
              "label": "b",
              "text": "List importance of Pharmacognosy."
            },
            {
              "id": "pharmacognosy-u1-sub-3",
              "label": "c",
              "text": "List drugs obtained from plant, animal, mineral, microorganism and marine sources."
            },
            {
              "id": "pharmacognosy-u1-sub-4",
              "label": "d",
              "text": "Classify crude drugs."
            },
            {
              "id": "pharmacognosy-u1-sub-5",
              "label": "e",
              "text": "Discuss commercial processing of crude drugs."
            },
            {
              "id": "pharmacognosy-u1-sub-6",
              "label": "f",
              "text": "List adulterants in crude drugs."
            },
            {
              "id": "pharmacognosy-u1-sub-7",
              "label": "g",
              "text": "List the parameters for quality evaluation of crude drugs as per WHO guidelines."
            },
            {
              "id": "pharmacognosy-u1-sub-8",
              "label": "h",
              "text": "List primary and secondary metabolites from natural products."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u2",
          "unitNumber": 2,
          "title": "Alkaloids",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u2-sub-1",
              "label": "a",
              "text": "Define alkaloids."
            },
            {
              "id": "pharmacognosy-u2-sub-2",
              "label": "b",
              "text": "List properties of alkaloids."
            },
            {
              "id": "pharmacognosy-u2-sub-3",
              "label": "c",
              "text": "Discuss chemical tests of alkaloids."
            },
            {
              "id": "pharmacognosy-u2-sub-4",
              "label": "d",
              "text": "Classify alkaloids."
            },
            {
              "id": "pharmacognosy-u2-sub-5",
              "label": "e",
              "text": "Discuss Biological source, Vernacular name, Chemical constituents and Uses of Belladonna, Rauwolfia, Opium, Vinca, Vasaka, Ephedra and Cinchona."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u3",
          "unitNumber": 3,
          "title": "Glycosides",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u3-sub-1",
              "label": "a",
              "text": "Define glycosides."
            },
            {
              "id": "pharmacognosy-u3-sub-2",
              "label": "b",
              "text": "List properties of glycosides."
            },
            {
              "id": "pharmacognosy-u3-sub-3",
              "label": "c",
              "text": "Discuss chemical tests of glycosides."
            },
            {
              "id": "pharmacognosy-u3-sub-4",
              "label": "d",
              "text": "Classify glycosides."
            },
            {
              "id": "pharmacognosy-u3-sub-5",
              "label": "e",
              "text": "Discuss Biological source, Chemical constituents and Uses of Digitalis, Aloe, Senna, Liquorice and Sapindus."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u4",
          "unitNumber": 4,
          "title": "Tannins",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u4-sub-1",
              "label": "a",
              "text": "Define tannins."
            },
            {
              "id": "pharmacognosy-u4-sub-2",
              "label": "b",
              "text": "List properties of tannins."
            },
            {
              "id": "pharmacognosy-u4-sub-3",
              "label": "c",
              "text": "Discuss chemical tests of tannins."
            },
            {
              "id": "pharmacognosy-u4-sub-4",
              "label": "d",
              "text": "Classify tannins."
            },
            {
              "id": "pharmacognosy-u4-sub-5",
              "label": "e",
              "text": "Discuss Biological source, Chemical constituents and Uses of Black Catechu, Betel, Insect gall and Myrobalans."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u5",
          "unitNumber": 5,
          "title": "Volatile oil/Essential oil",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u5-sub-1",
              "label": "a",
              "text": "Define essential oil."
            },
            {
              "id": "pharmacognosy-u5-sub-2",
              "label": "b",
              "text": "List properties of essential oil."
            },
            {
              "id": "pharmacognosy-u5-sub-3",
              "label": "c",
              "text": "Discuss parameters for analytical evaluation of essential oil."
            },
            {
              "id": "pharmacognosy-u5-sub-4",
              "label": "d",
              "text": "Discuss Biological source, Chemical constituents and Uses of Clove, Fennel, Coriander, Cardamom and Eucalyptus."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u6",
          "unitNumber": 6,
          "title": "Fixed oil",
          "hours": 10,
          "marks": 4,
          "subUnits": [
            {
              "id": "pharmacognosy-u6-sub-1",
              "label": "a",
              "text": "Define fixed oil."
            },
            {
              "id": "pharmacognosy-u6-sub-2",
              "label": "b",
              "text": "List properties of fixed oil."
            },
            {
              "id": "pharmacognosy-u6-sub-3",
              "label": "c",
              "text": "Discuss parameters for analytical evaluation of fixed oil."
            },
            {
              "id": "pharmacognosy-u6-sub-4",
              "label": "d",
              "text": "Differentiate between essential oil and fixed oil."
            },
            {
              "id": "pharmacognosy-u6-sub-5",
              "label": "e",
              "text": "Discuss Biological source, Chemical constituents and Uses of Castor, Mustard, Almond, Sesame and Linseed."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u7",
          "unitNumber": 7,
          "title": "Resin",
          "hours": 8,
          "marks": 7,
          "subUnits": [
            {
              "id": "pharmacognosy-u7-sub-1",
              "label": "a",
              "text": "Define resin."
            },
            {
              "id": "pharmacognosy-u7-sub-2",
              "label": "b",
              "text": "List properties of resin."
            },
            {
              "id": "pharmacognosy-u7-sub-3",
              "label": "c",
              "text": "Classify resin."
            },
            {
              "id": "pharmacognosy-u7-sub-4",
              "label": "d",
              "text": "Discuss Biological source, Chemical constituents and Uses of Ginger, Capsicum, Colophony, Asafoetida, Garlic and Guggul."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u8",
          "unitNumber": 8,
          "title": "Chromatography",
          "hours": 10,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u8-sub-1",
              "label": "",
              "text": "1. Define Chromatography. 2. Discuss mobile phase and stationary phase. 3. Discuss principle of chromatography. 4. List different types of chromatographic techniques. 5. Discuss the principle, procedure and application of Thin Layer Chromatography (TLC)."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u9",
          "unitNumber": 9,
          "title": "Extraction of phytochemicals",
          "hours": 5,
          "marks": 3,
          "subUnits": [
            {
              "id": "pharmacognosy-u9-sub-1",
              "label": "a",
              "text": "Define extraction."
            },
            {
              "id": "pharmacognosy-u9-sub-2",
              "label": "b",
              "text": "Discuss eluotropic series."
            },
            {
              "id": "pharmacognosy-u9-sub-3",
              "label": "c",
              "text": "Discuss the technique of distillation Maceration, Percolation, Decoction, Infusion"
            },
            {
              "id": "pharmacognosy-u9-sub-4",
              "label": "d",
              "text": "Discuss factor affecting extraction of secondary metabolites."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u10",
          "unitNumber": 10,
          "title": "Plant tissue culture",
          "hours": 3,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmacognosy-u10-sub-1",
              "label": "a",
              "text": "Discuss the principle of plant tissue culture."
            },
            {
              "id": "pharmacognosy-u10-sub-2",
              "label": "b",
              "text": "List the steps for conducting plant tissue culture."
            },
            {
              "id": "pharmacognosy-u10-sub-3",
              "label": "c",
              "text": "List application of plant tissue culture."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u11",
          "unitNumber": 11,
          "title": "Herbarium",
          "hours": 6,
          "marks": 4,
          "subUnits": [
            {
              "id": "pharmacognosy-u11-sub-1",
              "label": "a",
              "text": "Define herbarium."
            },
            {
              "id": "pharmacognosy-u11-sub-2",
              "label": "b",
              "text": "List major herbaria of the world."
            },
            {
              "id": "pharmacognosy-u11-sub-3",
              "label": "c",
              "text": "Discuss the procedure of preparing herbarium specimen."
            },
            {
              "id": "pharmacognosy-u11-sub-4",
              "label": "d",
              "text": "List the application of herbarium preparation."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u12",
          "unitNumber": 12,
          "title": "Pharmaceutical aids from natural sources",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmacognosy-u12-sub-1",
              "label": "",
              "text": "Write the biological source and uses of following"
            },
            {
              "id": "pharmacognosy-u12-sub-2",
              "label": "a",
              "text": "Filter aids: Talc, Bentonite"
            },
            {
              "id": "pharmacognosy-u12-sub-3",
              "label": "b",
              "text": "Ointment base: Bees wax, Lanolin"
            },
            {
              "id": "pharmacognosy-u12-sub-4",
              "label": "c",
              "text": "Thickening agent: Pectin, Tragacanth"
            },
            {
              "id": "pharmacognosy-u12-sub-5",
              "label": "d",
              "text": "Emulsifying and suspending agent: Agar, Gelatin, Guar gum"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u13",
          "unitNumber": 13,
          "title": "Ayurvedic formulation",
          "hours": 16,
          "marks": 12,
          "subUnits": [
            {
              "id": "pharmacognosy-u13-sub-1",
              "label": "",
              "text": "(Bhaisajjyakalpana) Write the general method of preparation and uses of the following"
            },
            {
              "id": "pharmacognosy-u13-sub-2",
              "label": "a",
              "text": "Churna: Triphalachurna, Sitopladichurna"
            },
            {
              "id": "pharmacognosy-u13-sub-3",
              "label": "b",
              "text": "Vati: Chandraprabhavati, Sanjivanivati"
            },
            {
              "id": "pharmacognosy-u13-sub-4",
              "label": "c",
              "text": "Arista: Asokarista, Dalmool arista"
            },
            {
              "id": "pharmacognosy-u13-sub-5",
              "label": "d",
              "text": "Asava: Kumariasava"
            },
            {
              "id": "pharmacognosy-u13-sub-6",
              "label": "e",
              "text": "Avaleha: Chyawanprashavaleha, Vasa avaleha"
            },
            {
              "id": "pharmacognosy-u13-sub-7",
              "label": "f",
              "text": "Bhasma: Lohabhasma, Swarnabhasma"
            },
            {
              "id": "pharmacognosy-u13-sub-8",
              "label": "g",
              "text": "Ghrita: Triphalaghrita, Bhramhighrita"
            },
            {
              "id": "pharmacognosy-u13-sub-9",
              "label": "h",
              "text": "Taila: Narayan taila, Anutaila"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacognosy-u14",
          "unitNumber": 14,
          "title": "Medicinal plants of Nepal having economic importance",
          "hours": 10,
          "marks": 7,
          "subUnits": [
            {
              "id": "pharmacognosy-u14-sub-1",
              "label": "",
              "text": "At the end of the course, students will be able to Write Biological source and commercial utilization/value added utilization of"
            },
            {
              "id": "pharmacognosy-u14-sub-2",
              "label": "a",
              "text": "Panchaunle"
            },
            {
              "id": "pharmacognosy-u14-sub-3",
              "label": "b",
              "text": "Shilajit"
            },
            {
              "id": "pharmacognosy-u14-sub-4",
              "label": "c",
              "text": "Punarnava"
            },
            {
              "id": "pharmacognosy-u14-sub-5",
              "label": "d",
              "text": "Gurjo"
            },
            {
              "id": "pharmacognosy-u14-sub-6",
              "label": "e",
              "text": "Timur"
            },
            {
              "id": "pharmacognosy-u14-sub-7",
              "label": "f",
              "text": "Jatamansi"
            },
            {
              "id": "pharmacognosy-u14-sub-8",
              "label": "g",
              "text": "Pasanvedh"
            },
            {
              "id": "pharmacognosy-u14-sub-9",
              "label": "h",
              "text": "Setomusli"
            },
            {
              "id": "pharmacognosy-u14-sub-10",
              "label": "i",
              "text": "Siplican"
            },
            {
              "id": "pharmacognosy-u14-sub-11",
              "label": "j",
              "text": "Thulookhati"
            },
            {
              "id": "pharmacognosy-u14-sub-12",
              "label": "k",
              "text": "Yarsagumba"
            },
            {
              "id": "pharmacognosy-u14-sub-13",
              "label": "l",
              "text": "Kurilo"
            },
            {
              "id": "pharmacognosy-u14-sub-14",
              "label": "m",
              "text": "Chiraito"
            },
            {
              "id": "pharmacognosy-u14-sub-15",
              "label": "n",
              "text": "Nisodh"
            },
            {
              "id": "pharmacognosy-u14-sub-16",
              "label": "o",
              "text": "Dhasingre"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Demonstrate different parts of microscope and their application.",
        "Perform microscopical and microscopical analysis of the minimum 5 crude drugs (Leaf, bark, rhizome, root fruit) specified in the course.",
        "Perform Thin layer chromatography of given crude drug.",
        "Perform extraction of crude drug by soxhlet apparatus.",
        "Perform extraction of crude drug by reflux condenser.",
        "Perform extraction of essential oil from given crude drug by Clevenger apparatus.",
        "Perform phytochemical test of given crude drug.",
        "Prepare minimum three Ayurveda formulations specified in the course.",
        "Collect and prepare the herbarial specimen of the collected medicinal plant using standard format.",
        "Visit and observe Plant tissue culture laboratory and herbarium, botanical gardens and prepare report. (5 days studies visit)"
      ],
      "references": [
        "Evans W.C. Trease and Evans Pharmacognosy. W.B. Saunders & co. London.",
        "Kokate C K, Purohit A. P, Gokhale S. B. Pharmacognosy Pune.",
        "Rangari V. D. Pharmacognosy and Phytochemistry. Career publication, Nashik.",
        "Tyler E, Brady R.Pharmacognosy. Philadelphia P.A, U.S.A.",
        "Nakanishi K. Chemistry of Natural Products. Kodausha Book Publishing Company, Osaka",
        "HarborneJ.B. Phytochemical Methods. Chaparan & Hall, London.",
        "Kalia A.N. Textbook of Industrial Pharmacognosy.",
        "Wallis T.E. Text Book of Pharmacognosy."
      ]
    },
    {
      "id": "biochemistry-microbiology",
      "name": "Biochemistry and Microbiology",
      "theoryHours": 3,
      "practicalHours": 2,
      "totalHours": 5,
      "creditHours": 4,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "Biochemistry deals with understanding of the molecular levels of th e chemical process associated with living cells. The scope of the subject is to provide biochemical facts and the principles to understand metabolism of nutrient molecules in physiological and pathological conditions.",
      "objectives": [
        "Discuss the biomolecules and their biological importance",
        "Compare and contrast the metabolism of biomolecules in physiological and pathological conditions.",
        "Discuss the biochemical basis of normal and diseased conditions of different organ systems",
        "Outline the genetic organization of mammalian genome",
        "List functions of DNA in the synthesis of RNAs and proteins."
      ],
      "units": [
        {
          "id": "biochemistry-microbiology-u1",
          "unitNumber": 1,
          "title": "Introduction",
          "hours": 2,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u1-sub-1",
              "label": "1.1",
              "text": "Introduction to biochemistry and its importance for health science."
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u2",
          "unitNumber": 2,
          "title": "Biomolecules",
          "hours": 26,
          "marks": 15,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u2-sub-1",
              "label": "",
              "text": "Discuss Introduction, classification basic metabolism and clinical significances of the following biomolecules."
            },
            {
              "id": "biochemistry-microbiology-u2-sub-2",
              "label": "2.1",
              "text": "Carbohydrates: Glycolysis, Citric acid cycle"
            },
            {
              "id": "biochemistry-microbiology-u2-sub-3",
              "label": "2.2",
              "text": "Amino acids, Peptides and Proteins: Urea cycle"
            },
            {
              "id": "biochemistry-microbiology-u2-sub-4",
              "label": "2.2",
              "text": "Lipids and fatty acids: Beta-oxidation of fatty acid"
            },
            {
              "id": "biochemistry-microbiology-u2-sub-5",
              "label": "2.3",
              "text": "Interpret the relation of Carbohydrate, Fat and Protein metabolism."
            },
            {
              "id": "biochemistry-microbiology-u2-sub-6",
              "label": "2.4",
              "text": "Vitamins"
            },
            {
              "id": "biochemistry-microbiology-u2-sub-7",
              "label": "2.5",
              "text": "Enzymes: Coenzymes, Isoenzymes"
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u3",
          "unitNumber": 3,
          "title": "Basic concepts of nucleic acid and recombinant DNA technology",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u3-sub-1",
              "label": "4.1",
              "text": "Define, nucleotide, nucleoside, nucleic acid, gene, genome, chromosomes."
            },
            {
              "id": "biochemistry-microbiology-u3-sub-2",
              "label": "4.2",
              "text": "Differentiate between DNA and RNA."
            },
            {
              "id": "biochemistry-microbiology-u3-sub-3",
              "label": "4.3",
              "text": "Discuss DNA replication, transcription and translation."
            },
            {
              "id": "biochemistry-microbiology-u3-sub-4",
              "label": "4.3",
              "text": "List pharmaceutical recombinant products and their uses."
            },
            {
              "id": "biochemistry-microbiology-u3-sub-5",
              "label": "4.4",
              "text": "Discuss the application of gene sequencing and polymerase chain reactions."
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u4",
          "unitNumber": 4,
          "title": "Review of Common Laboratory and Diagnostic tests",
          "hours": 6,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u4-sub-1",
              "label": "",
              "text": "List out Complete blood count, liver function test, kidney function test, thyroid function test, Lipid Profile, Blood sugar, urine and stool analysis with specific reference to normal value"
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u5",
          "unitNumber": 5,
          "title": "Fundamental of Immunology",
          "hours": 6,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u5-sub-1",
              "label": "5.1",
              "text": "Define Immunity and its types."
            },
            {
              "id": "biochemistry-microbiology-u5-sub-2",
              "label": "5.2",
              "text": "Define antigens, antibody, and immunoglobulin, vaccines, sera and anti sera with suitable examples."
            },
            {
              "id": "biochemistry-microbiology-u5-sub-3",
              "label": "5.3",
              "text": "List types of vaccine with examples."
            },
            {
              "id": "biochemistry-microbiology-u5-sub-4",
              "label": "5.4",
              "text": "Compare and contrast T and B-lymphocytes,"
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u6",
          "unitNumber": 6,
          "title": "Introduction to microbiology",
          "hours": 5,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u6-sub-1",
              "label": "1.1",
              "text": "Define Microbiology and list its importance and branches."
            },
            {
              "id": "biochemistry-microbiology-u6-sub-2",
              "label": "1.2",
              "text": "Outline the historical development of pharmaceutical microbiology."
            },
            {
              "id": "biochemistry-microbiology-u6-sub-3",
              "label": "1.3",
              "text": "Point out application of microbiology in pharmaceutical sciences."
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u7",
          "unitNumber": 7,
          "title": "Microorganisms",
          "hours": 25,
          "marks": 15,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u7-sub-1",
              "label": "",
              "text": "Bacteria [20 Hrs.] Discuss general morphology, and classification of bacteria. Differentiate gram positive and negative bacteria. Illustrate bacterial Growth curve. Identify nutritional requirements and factors affecting growth. List different type of Culture Media with their preparation and application. Discuss principle and procedures of staining techniques. (Simple staining, Gram staining and AFB staining) Discuss mechanism of Bacterial resistance to antimicrobial therapy. Viruses [2 Hrs.]",
              "details": [
                "Define virus and classify it.",
                "Illustrate the morphology of virus. Fungi/yeast/molds [3Hrs]",
                "Define Fungus, yeast and molds.",
                "Discuss the morphology of fungus.",
                "List pharmaceutical importance of fungi and yeasts."
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u8",
          "unitNumber": 8,
          "title": "Normal flora",
          "hours": 4,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u8-sub-1",
              "label": "",
              "text": "Identify the normal flora of skin, gastrointestinal tract, ear, nose and genitourinary tract and specify their roles in normal physiology."
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u9",
          "unitNumber": 9,
          "title": "Sterilization",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u9-sub-1",
              "label": "",
              "text": "",
              "details": [
                "Define sterilization and disinfection.",
                "Identify crib different method of sterilization and disinfections with suitable examples.",
                "Describe sterility testing (Membrane filtration method and LAL test)"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "biochemistry-microbiology-u10",
          "unitNumber": 10,
          "title": "Microbiological assay",
          "hours": 6,
          "marks": 5,
          "subUnits": [
            {
              "id": "biochemistry-microbiology-u10-sub-1",
              "label": "",
              "text": "",
              "details": [
                "Discuss microbial assay of antibiotics (disc diffusion and tube dilution method) and vitamins (cyanocobalamine)"
              ]
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Perform the test of Carbohydrate: Molisch Test/ Benedict's test and iodine test for starch.",
        "Perform the test for Proteins: Biuret test in urine:",
        "Perform the test for Amino acids: Ninhydrin Test",
        "Perform the test of dextrose as blood sugar (Enzymatic test).",
        "Perform the test for: Urea, Bilirubin and Creatinine in blood sample.",
        "Perform qualitative tests of abnormal urinary constituents (Glucose, ketone bodies, hemoglobin)",
        "Microbiology practical [35 Hrs.]",
        "Study of instruments used in Microbiology laboratory.",
        "Identify microorganism by gram staining",
        "Perform AFB staining and microscopic examination of Sputum by ZN staining.",
        "Demonstrate various bacterial colonies (Perform quadrant streak technique to isolate pure colonies)",
        "Carry out dry heat sterilization and moist heat sterilization",
        "Demonstrate the antibiotic sensitivity test by Kirby Bauer Disc Diffusion method",
        "Preparation of different culture media"
      ],
      "references": [
        "Furest R - Micorbiology in Health and Disease, W.B Saunder& Co,",
        "Bialley and Scott - Digonostic Microbiology.",
        "Rawling's EA-Benty's text book of Pharmaceutics. All India Traveller Book Sellers"
      ]
    },
    {
      "id": "pharmacotherapeutics-1",
      "name": "Pharmacotherapeutics I",
      "theoryHours": 4,
      "practicalHours": 0,
      "totalHours": 4,
      "creditHours": 4,
      "theoryMarks": 80,
      "practicalMarks": 0,
      "totalMarks": 100,
      "description": "This course is designed to impart knowledge and skills necessary for contribution to quality use of medicines. This will enable the student to describe the introduction, clinical manifestation and pathophysiology of common diseases and their management.",
      "objectives": [
        "Describe the pathophysiology of selected disease states and explain the rationale for drug therapy",
        "Summarize the therapeutic approach to management of these diseases including reference to the latest available evidence",
        "Discuss the controversies in drug therapy",
        "Discuss the preparation of individualized therapeutic plans based on diagnosis; and",
        "Identify the patient",
        "specific parameters relevant in initiating drug therapy, and monitoring therapy (including alternatives, time",
        "course of clinical and laboratory indices of therapeutic response and adverse effects)."
      ],
      "units": [
        {
          "id": "pharmacotherapeutics-1-u1",
          "unitNumber": 1,
          "title": "Gastrointestinal system:",
          "hours": 30,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-1-u1-sub-1",
              "label": "1.1",
              "text": "Define gastritis, ulcer, colitis, pancreatitis, dyspepsia."
            },
            {
              "id": "pharmacotherapeutics-1-u1-sub-2",
              "label": "1.2",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, non",
              "details": [
                "pharmacological management, complication, and referral of Vomiting, diarrhea, constipation GERD, dysentery Alcoholic liver disease, viral hepatitis including jaundice"
              ]
            },
            {
              "id": "pharmacotherapeutics-1-u1-sub-3",
              "label": "1.3",
              "text": "Define Peptic ulcer disease PUD). Describe etiological classification, pathophysiology, clinical features, pharmacological treatment guidelines and non-pharmacological management of PUD."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-1-u2",
          "unitNumber": 2,
          "title": "Musculoskeletal disorders:",
          "hours": 15,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-1-u2-sub-1",
              "label": "2.1",
              "text": "Define pain, sciatica and shingles. Describe Pain pathways and Pain management (WHO analgesic ladder)."
            },
            {
              "id": "pharmacotherapeutics-1-u2-sub-2",
              "label": "2.2",
              "text": "Introduction, Causes, clinical manifestations, invest igation, prevention, pharmacological treatment with doses regimen, non",
              "details": [
                "pharmacological management, complication, and referral of Rheumatoid arthritis, Osteoarthritis, Gout, Spondylitis, Osteoporosis, Myasthenia Gravis."
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-1-u3",
          "unitNumber": 3,
          "title": "Nervous system:",
          "hours": 35,
          "marks": 25,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-1-u3-sub-1",
              "label": "3.1",
              "text": "Define Motor neuron disease, Multiple sclerosis, Cerebral palsy, Alzheimer’s Disease"
            },
            {
              "id": "pharmacotherapeutics-1-u3-sub-2",
              "label": "3.2",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication, and referral of Epilepsy, Parkinsonism, and Stroke Depression, psychosis Disorder, anxiety disorder"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-1-u4",
          "unitNumber": 4,
          "title": "Respiratory system",
          "hours": 30,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-1-u4-sub-1",
              "label": "4.1",
              "text": "Define pulmonary effusion, emphysema, Cystic Fibrosis."
            },
            {
              "id": "pharmacotherapeutics-1-u4-sub-2",
              "label": "4.2",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication, and referral of Asthma, Chronic obstructive pulmonary disease, acute bronchitis."
            },
            {
              "id": "pharmacotherapeutics-1-u4-sub-3",
              "label": "4.3",
              "text": "Define Pneumonia. Describe etiological classification, pathophysiology, clinical features, pharmacological treatment guidelines and non-pharmacological management of pneumonia."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-1-u5",
          "unitNumber": 5,
          "title": "Infectious disease:",
          "hours": 30,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-1-u5-sub-1",
              "label": "5.1",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication, guidelines for the rational use of antibiotics and surgical Prophylaxis, and referral of Tuberculosis(DOTS therapy for PTB according national guideline), Meningitis, Gastroenteritis, typhoid , Cholera, Septicaemia, Urinary tract infections*, Malaria, Kalazar, Fungal infections( ring worm), Viral infections( Rhinitis, Herpes Zoster, Measels chicken pox, HIV",
              "details": [
                "AIDS, SARS",
                "COVID 19), Gonorrhoea and Syphilis."
              ]
            },
            {
              "id": "pharmacotherapeutics-1-u5-sub-2",
              "label": "5.2",
              "text": "Classify disease according to causative agents and describe Diagnosis, management and prevention of common communicable diseases: Filariasis, Dengue fever, Dysentery (Amoebic & Bacillary), Giardiasis, Brucellosis, Rabies, Food poisoning, Influenza, Swine flu (H1N1), SARS, Bird flu, Typhus fever, Worm infestations (Hook worm, Round worm, Trichuristrichiura, Tape worm (Teniasolium, Tania, saginata, H. nana)"
            },
            {
              "id": "pharmacotherapeutics-1-u5-sub-3",
              "label": "5.3",
              "text": "Define Urinary tract infection (UTI). Describe etiological classification, pathophysiology, clinical features, pharmacological treatment guidelines and non-pharmacological management of UTI."
            }
          ],
          "completed": false
        }
      ],
      "references": [
        "Roger Walker and Cleve Edwards: Clinical Pharmacy and Therapeutics.",
        "Sathoskar, Pharmacology and pharmacotherapeutics, Vol. 1 & 2, Publ by Popular Prakashan, Mumbai.",
        "DiPiro JT, Talbert RL, Yee GC, Matzke GR, Wells BG, Posey LM, editors. Pharmacotherapy: a pathophysiologic approach. 8th ed. Columbus",
        "Washington Manual and Medical therapeutics, 32nd Edition.",
        "Bertram. G. Katzung, Basic and clinical pharmacology",
        "J.G. Hardman and Lee E. Limbard, Good Mann &Gilmann: The Pharmacological basis of therapeutics, McGraw hill, Health Professions Dvn.",
        "Lippincott Williams and Wilkins: Remington Pharmaceutical Sciences, 20th Edition. Hamsten, Drug interaction, KvenStockley.",
        "Laurence, DR and Bennet PN. Clinical Pharmacology, Scientific book agency",
        "Grahame smith and Aronson, Clinical pharmacology and drug therapy",
        "Richard A Helms, Text Book of Therapeutics Drug and Disease Management Hardbound.",
        "Herfindal E T and Hirschman JL, Williams and Wilkins, Clinical Pharmacy and therapeutics",
        "Applied Therapeutics, the clinical uses of Drugs applied therapeutics INC"
      ]
    },
    {
      "id": "pharmaceutical-management",
      "name": "Pharmaceutical Management",
      "theoryHours": 2,
      "practicalHours": 0,
      "totalHours": 2,
      "creditHours": 2,
      "theoryMarks": 40,
      "practicalMarks": 0,
      "totalMarks": 50,
      "description": "This course is designed to equip students with the knowledge and skills on business organization and management, economic theory and financial management. The course is also focused on management of a community pharmacy, management of Public Medicine supply and pharmaceutical marketing.",
      "objectives": [
        "Develop general concept of business management.",
        "Describe economic theory applicable to pharmaceuticals.",
        "Develop basic managerial skills and financial management skills applicable in pharmaceutical sectors.",
        "Develop concept of marketing skills and apply them in the pharmaceutical sector.",
        "Manage community pharmacy."
      ],
      "units": [
        {
          "id": "pharmaceutical-management-u1",
          "unitNumber": 1,
          "title": "Fundamentals of management",
          "hours": 15,
          "marks": 7,
          "subUnits": [
            {
              "id": "pharmaceutical-management-u1-sub-1",
              "label": "a",
              "text": "Discuss the concept and function of management."
            },
            {
              "id": "pharmaceutical-management-u1-sub-2",
              "label": "b",
              "text": "Discuss principles and importance of management."
            },
            {
              "id": "pharmaceutical-management-u1-sub-3",
              "label": "c",
              "text": "Distinguish between management and administration"
            },
            {
              "id": "pharmaceutical-management-u1-sub-4",
              "label": "d",
              "text": "Elaborate the roles and responsibilities of a manager."
            },
            {
              "id": "pharmaceutical-management-u1-sub-5",
              "label": "e",
              "text": "Discuss the stages of making a rational decision."
            },
            {
              "id": "pharmaceutical-management-u1-sub-6",
              "label": "f",
              "text": "Characterize the types of modern organizational structures."
            },
            {
              "id": "pharmaceutical-management-u1-sub-7",
              "label": "g",
              "text": "Discuss the concept and theories of Maslow of motivation."
            },
            {
              "id": "pharmaceutical-management-u1-sub-8",
              "label": "h",
              "text": "Introduction, characteristics and styles of leadership."
            },
            {
              "id": "pharmaceutical-management-u1-sub-9",
              "label": "i",
              "text": "Discuss the objectives, importance and functions of HRM"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutical-management-u2",
          "unitNumber": 2,
          "title": "Pharmaceutical Logistics and Supply Chain Management",
          "hours": 15,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutical-management-u2-sub-1",
              "label": "a",
              "text": "Define supply chain management."
            },
            {
              "id": "pharmaceutical-management-u2-sub-2",
              "label": "b",
              "text": "Identify the major components of the pharmaceutical supply chain network"
            },
            {
              "id": "pharmaceutical-management-u2-sub-3",
              "label": "c",
              "text": "Identify major components of pharmaceutical supply chain management"
            },
            {
              "id": "pharmaceutical-management-u2-sub-4",
              "label": "d",
              "text": "Discuss Pharmaceutical Supply process."
            },
            {
              "id": "pharmaceutical-management-u2-sub-5",
              "label": "e",
              "text": "Discuss challenges in Pharmaceutical Supply Chain."
            },
            {
              "id": "pharmaceutical-management-u2-sub-6",
              "label": "f",
              "text": "Estimate medicine requirements, Procurement cycle (Tender process) and its methods."
            },
            {
              "id": "pharmaceutical-management-u2-sub-7",
              "label": "g",
              "text": "Describe storage of medicines including vaccines."
            },
            {
              "id": "pharmaceutical-management-u2-sub-8",
              "label": "h",
              "text": "Mention pharmaceutical logistics and supply chain management system for health care system."
            },
            {
              "id": "pharmaceutical-management-u2-sub-9",
              "label": "i",
              "text": "Discuss and demonstrate the importance of Pharmacy Management Software."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutical-management-u3",
          "unitNumber": 3,
          "title": "Pharmaceutical marketing",
          "hours": 20,
          "marks": 7,
          "subUnits": [
            {
              "id": "pharmaceutical-management-u3-sub-1",
              "label": "a",
              "text": "Identify major marketing concepts/Marketing strategies"
            },
            {
              "id": "pharmaceutical-management-u3-sub-2",
              "label": "b",
              "text": "Discuss SWOT analysis in marketing."
            },
            {
              "id": "pharmaceutical-management-u3-sub-3",
              "label": "c",
              "text": "Describe Market mix (Product, Price, People, Physical environment, Process, Promotion and Place)."
            },
            {
              "id": "pharmaceutical-management-u3-sub-4",
              "label": "d",
              "text": "Discuss Segmentation, Positioning and Targeting in marketing."
            },
            {
              "id": "pharmaceutical-management-u3-sub-5",
              "label": "e",
              "text": "Differentiate between sales and marketing."
            },
            {
              "id": "pharmaceutical-management-u3-sub-6",
              "label": "f",
              "text": "Discuss principle of sales promotion."
            },
            {
              "id": "pharmaceutical-management-u3-sub-7",
              "label": "g",
              "text": "Estimate current demand and industry sales (Product Management Department)"
            },
            {
              "id": "pharmaceutical-management-u3-sub-8",
              "label": "h",
              "text": "Discuss emerging trends in marketing (Network marketing and Digital pharmaceutical marketing)."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutical-management-u4",
          "unitNumber": 4,
          "title": "Entrepreneurship and Innovation",
          "hours": 6,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutical-management-u4-sub-1",
              "label": "a",
              "text": "Define entrepreneurship."
            },
            {
              "id": "pharmaceutical-management-u4-sub-2",
              "label": "b",
              "text": "Discuss the principle and application of entrepreneurship in the profession of pharmacy"
            },
            {
              "id": "pharmaceutical-management-u4-sub-3",
              "label": "c",
              "text": "Discuss characteristics and types of entrepreneurs."
            },
            {
              "id": "pharmaceutical-management-u4-sub-4",
              "label": "d",
              "text": "Discuss role and impact of entrepreneurship in Nepalese pharmaceutical sector."
            },
            {
              "id": "pharmaceutical-management-u4-sub-5",
              "label": "e",
              "text": "Identify causes for the success and failure of business in Nepal."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutical-management-u5",
          "unitNumber": 5,
          "title": "Pharmacoeconomics and Accounting management",
          "hours": 14,
          "marks": 15,
          "subUnits": [
            {
              "id": "pharmaceutical-management-u5-sub-1",
              "label": "a",
              "text": "Definition, Principle, importance and application, of Pharmacoeconomics,"
            },
            {
              "id": "pharmaceutical-management-u5-sub-2",
              "label": "b",
              "text": "Discuss laws of demand and supply."
            },
            {
              "id": "pharmaceutical-management-u5-sub-3",
              "label": "c",
              "text": "Describe general concept of cost and cost accounting."
            },
            {
              "id": "pharmaceutical-management-u5-sub-4",
              "label": "d",
              "text": "Discuss Taxation and its types."
            },
            {
              "id": "pharmaceutical-management-u5-sub-5",
              "label": "e",
              "text": "Characterize alternative health care financing (Insurance) system in Nepal."
            },
            {
              "id": "pharmaceutical-management-u5-sub-6",
              "label": "f",
              "text": "Discuss the concept and techniques of inventory management."
            }
          ],
          "completed": false
        }
      ],
      "references": [
        "Managing Drug Supply, Published by NG, DHS/MoH.",
        "Kotler P. Keller K. L. Marketing Management. Prentice Hall of India. New Delhi.",
        "Walker O. C, Boyd H. W, Larreche J. C. Marketing strategy: Planning and implementation. McGraw-Hill/Irwin.",
        "Smith M. C. Pharmaceutical marketing: strategy and cases. CRC Press.",
        "Lidstone J, MacLennan J. Marketing planning for the pharmaceutical industry. Routledge.",
        "Katsanis L. P. Global issues in pharmaceutical marketing. Routledge.",
        "Rollins B. L, Perri M. Pharmaceutical marketing. Jones & Bartlett Publishers."
      ]
    },
    {
      "id": "public-health-pharmacy",
      "name": "Public Health Pharmacy",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to acquaint students with knowledge and skills on health education, health care delivery system, pharmacoepidemiology in addressing drug related questions in a large population and environmental impact to the health.",
      "objectives": [
        "Find out health education needs related to pharmacy and deliberate both planned and incidental health education to individual, family and the community.",
        "Understand health care delivery system in Nepal.",
        "Describe epidemiology and epidemiological concepts.",
        "Describe environment, environmental health, and environmental pollution."
      ],
      "units": [
        {
          "id": "public-health-pharmacy-u1",
          "unitNumber": 1,
          "title": "Health education",
          "hours": 30,
          "marks": 15,
          "subUnits": [
            {
              "id": "public-health-pharmacy-u1-sub-1",
              "label": "1.1",
              "text": "Concept of Health [5 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u1-sub-2",
              "label": "a",
              "text": "Define health."
            },
            {
              "id": "public-health-pharmacy-u1-sub-3",
              "label": "b",
              "text": "Differentiate promotive, preventive, curative and rehabilitative health services."
            },
            {
              "id": "public-health-pharmacy-u1-sub-4",
              "label": "c",
              "text": "List factors that influence health."
            },
            {
              "id": "public-health-pharmacy-u1-sub-5",
              "label": "1.2",
              "text": "Principles and scope of health education. [5 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u1-sub-6",
              "label": "a",
              "text": "Discuss principles of health education."
            },
            {
              "id": "public-health-pharmacy-u1-sub-7",
              "label": "b",
              "text": "State importance of health education in pharmacy"
            },
            {
              "id": "public-health-pharmacy-u1-sub-8",
              "label": "1.3",
              "text": "Learning [5 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u1-sub-9",
              "label": "a",
              "text": "Define learning."
            },
            {
              "id": "public-health-pharmacy-u1-sub-10",
              "label": "b",
              "text": "Describe different way of learning such as; by hearing, by seeing, by doing, by repetition, and by imitation."
            },
            {
              "id": "public-health-pharmacy-u1-sub-11",
              "label": "c",
              "text": "Discuss factor-affecting learning."
            },
            {
              "id": "public-health-pharmacy-u1-sub-12",
              "label": "1.4",
              "text": "Health education methods and media [15 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u1-sub-13",
              "label": "a",
              "text": "Discuss different methods with advantages and disadvantages",
              "details": [
                "Individual method: Interview and Counseling",
                "Group method: Group discussion, Role-play, Brain storming, Work-shop",
                "Mass Method: Lecture, exhibition"
              ]
            },
            {
              "id": "public-health-pharmacy-u1-sub-14",
              "label": "b",
              "text": "Discuss criteria for the selection of media."
            },
            {
              "id": "public-health-pharmacy-u1-sub-15",
              "label": "c",
              "text": "Describe different media to provide health education with advantages and disadvantages."
            }
          ],
          "completed": false
        },
        {
          "id": "public-health-pharmacy-u2",
          "unitNumber": 2,
          "title": "Health care delivery system in Nepal",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "public-health-pharmacy-u2-sub-1",
              "label": "a",
              "text": "Current organogram of health care system of Nepal."
            },
            {
              "id": "public-health-pharmacy-u2-sub-2",
              "label": "b",
              "text": "Define Primary Health Care and Alma atta declaration."
            },
            {
              "id": "public-health-pharmacy-u2-sub-3",
              "label": "c",
              "text": "Discuss principles of Primary Health Care."
            },
            {
              "id": "public-health-pharmacy-u2-sub-4",
              "label": "d",
              "text": "List and explain elements of Primary Health Care."
            },
            {
              "id": "public-health-pharmacy-u2-sub-5",
              "label": "e",
              "text": "Describe role of pharmacist in PHC."
            },
            {
              "id": "public-health-pharmacy-u2-sub-6",
              "label": "f",
              "text": "Describe Health related aspects of Millennium development goal and SDG."
            }
          ],
          "completed": false
        },
        {
          "id": "public-health-pharmacy-u3",
          "unitNumber": 3,
          "title": "Pharmacoepidemiology",
          "hours": 40,
          "marks": 25,
          "subUnits": [
            {
              "id": "public-health-pharmacy-u3-sub-1",
              "label": "a",
              "text": "Introductions, scope and uses of Epidemiology."
            },
            {
              "id": "public-health-pharmacy-u3-sub-2",
              "label": "b",
              "text": "Define Pharmacoepidemiology and describe its importance."
            },
            {
              "id": "public-health-pharmacy-u3-sub-3",
              "label": "c",
              "text": "Discuss diseases transmission (Chain of Infection), prevention and control."
            },
            {
              "id": "public-health-pharmacy-u3-sub-4",
              "label": "d",
              "text": "Outline Epidemiological triad (Agent, Host and Environmental interaction) with suitable examples."
            },
            {
              "id": "public-health-pharmacy-u3-sub-5",
              "label": "e",
              "text": "Define measures of morbidity with examples (Incidence and Prevalence)"
            },
            {
              "id": "public-health-pharmacy-u3-sub-6",
              "label": "f",
              "text": "Define measures of mortality with examples (Crude death rate, Specific death rate, Birth rate, Infant mortality rate, maternal mortality rate)."
            },
            {
              "id": "public-health-pharmacy-u3-sub-7",
              "label": "g",
              "text": "Define measures of risk with examples (Relative risk, Attributable risk and Odds Ratio)"
            },
            {
              "id": "public-health-pharmacy-u3-sub-8",
              "label": "h",
              "text": "Define Epidemic, Endemic and Pandemic with examples."
            },
            {
              "id": "public-health-pharmacy-u3-sub-9",
              "label": "i",
              "text": "Briefly discuss different epidemiological studies (Descriptive studies/observational studies, Analytical studies and Experimental studies) with suitable examples."
            }
          ],
          "completed": false
        },
        {
          "id": "public-health-pharmacy-u4",
          "unitNumber": 4,
          "title": "Environmental health",
          "hours": 50,
          "marks": 30,
          "subUnits": [
            {
              "id": "public-health-pharmacy-u4-sub-1",
              "label": "4.1",
              "text": "Define Environment, Environmental Health, Sanitation and Hygiene and Environmental Pollution. [2 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u4-sub-2",
              "label": "4.2",
              "text": "Water and water pollution [15 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u4-sub-3",
              "label": "a",
              "text": "Discuss water quality standards with respect to Physical, chemical and biological."
            },
            {
              "id": "public-health-pharmacy-u4-sub-4",
              "label": "b",
              "text": "Differentiate hard and soft water."
            },
            {
              "id": "public-health-pharmacy-u4-sub-5",
              "label": "c",
              "text": "Describe process of removing hardness of water."
            },
            {
              "id": "public-health-pharmacy-u4-sub-6",
              "label": "d",
              "text": "Describe uses of water: Domestic purpose, Public purpose, Industrial purpose and Agricultural purpose."
            },
            {
              "id": "public-health-pharmacy-u4-sub-7",
              "label": "e",
              "text": "Describe major water pollutants: organic pollutants and inorganic pollutants."
            },
            {
              "id": "public-health-pharmacy-u4-sub-8",
              "label": "f",
              "text": "Discuss different health impact due to water pollution."
            },
            {
              "id": "public-health-pharmacy-u4-sub-9",
              "label": "g",
              "text": "Describe large scale and small scale water purification methods, including:",
              "details": [
                "Household water purification: Boiling, filtration, and chemical treatment SODIS",
                "Large-scale purification: Slow sand filtration and Rapid sand filtration."
              ]
            },
            {
              "id": "public-health-pharmacy-u4-sub-10",
              "label": "4.3",
              "text": "Air [5 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u4-sub-11",
              "label": "4.4",
              "text": "Define air pollution."
            },
            {
              "id": "public-health-pharmacy-u4-sub-12",
              "label": "a",
              "text": "Discuss health effect of air pollution"
            },
            {
              "id": "public-health-pharmacy-u4-sub-13",
              "label": "b",
              "text": "Describe measures to control air pollution"
            },
            {
              "id": "public-health-pharmacy-u4-sub-14",
              "label": "4.5",
              "text": "Waste management [16 Hrs.]"
            },
            {
              "id": "public-health-pharmacy-u4-sub-15",
              "label": "a",
              "text": "Classify waste as solid waste and liquid waste"
            },
            {
              "id": "public-health-pharmacy-u4-sub-16",
              "label": "b",
              "text": "Discuss different color’s of bin for segregation of waste"
            },
            {
              "id": "public-health-pharmacy-u4-sub-17",
              "label": "c",
              "text": "Describe process of solid waste management: collection, storage, transportation and disposal: sanitary land filling, dumping, composting and incineration."
            },
            {
              "id": "public-health-pharmacy-u4-sub-18",
              "label": "d",
              "text": "Describe methods of liquid waste management: At household/institutional levels;",
              "details": [
                "Soakage pit,",
                "Soak well,",
                "Seepage pit,",
                "Dispersion trench,",
                "Septic tanks"
              ]
            },
            {
              "id": "public-health-pharmacy-u4-sub-19",
              "label": "e",
              "text": "Differentiate between biodegradable and non-biodegradable waste"
            },
            {
              "id": "public-health-pharmacy-u4-sub-20",
              "label": "f",
              "text": "Describe technique for minimizing waste: 3R concept;",
              "details": [
                "Reuse,",
                "Reduce,",
                "Recycle"
              ]
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Health Education a. Apply the planning, implementation and evaluation process to develop a health education program for a selected health problem. b. Make a health education plan on any of the health problem in community c. Collect health education materials from different organizations. d. Prepare a material for use of multimedia e. Prepare a Poster f. Prepare a pamphlet g. Prepare a flip chart h. Prepare a leaflet i. Perform a role play in class room setting j. Plan and conduct an exhibition at College settings.",
        "Health Care System a. Make an organogram of health facility. b. Observe activities delivered to the patient and community. c. Identify elements of PHC focusing on most frequently and rarely performed elements",
        "Pharmacoepidemiology a. Illustrate a Chain of Infection using suitable example. b. Outline Epidemiological triad (Agent, Host and Environmental interaction) with suitable examples. c. Calculate vital statistics from given data (Maternal mortality rate, Infant mortality rate, Mobidity rate, Crude death rate, Crude birth rate, Odds ratio, Relative risk Prevalence and incidence rate).",
        "Environmental health a. Calculate water requirement for daily domestic purpose. b. Calculate the amount of bleaching powder necessary for well disinfections. c. Visit water treatment plant: Make a one day field visit and prepare report. d. Visit pasteurization plant: Make a one day field visit and prepare report e. Solid waste management: Make a one day field visit and prepare report"
      ],
      "references": [
        "Pradhan, HB., A Textbook of Health Education, Educational Resources for Health, Kathmandu."
      ]
    }
  ]
};

export const thirdYearData: YearData = {
  "year": 3,
  "subjects": [
    {
      "id": "pharmaceutics-2",
      "name": "Pharmaceutics II",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to provide students the knowledge and skills about pharmaceutics. This course deals with Preformulation Studies, different dosage forms, biphasic pharmaceutical products, aerosol, parenteral preparation, powders, suppositories, and ophthalmic products. Additionally, it deals with packaging materials, Quality Assurance and Quality Management, method of dispensing, concept of novel Drug delivery systems, Pilot plant scale up techniques and brief introduction about cosmetics.",
      "objectives": [
        "Discuss basics of different dosage forms and pharmaceutical incompatibilities",
        "Discuss professional way of handling the prescription",
        "Discuss various pharmaceutical dosage forms and their manufacturing techniques.",
        "Formulate solid, liquid and semisolid dosage forms and evaluate them for their quality",
        "Discuss GMP aspects in a pharmaceutical industry",
        "Describe importance of documentation",
        "Describe responsibilities of QA & QC departments",
        "Describe area of novel drug delivery systems."
      ],
      "units": [
        {
          "id": "pharmaceutics-2-u1",
          "unitNumber": 1,
          "title": "Preformulation Studies",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u1-sub-1",
              "label": "",
              "text": "Introduction to preformulation, goals and objectives, study of physicochemical characteristics of drug substances."
            },
            {
              "id": "pharmaceutics-2-u1-sub-2",
              "label": "a",
              "text": "Physical properties: Physical form (crystal & amorphous), particle size, shape, flow properties, solubility profile (pKa, pH, partition coefficient), polymorphism"
            },
            {
              "id": "pharmaceutics-2-u1-sub-3",
              "label": "b",
              "text": "Chemical Properties: Hydrolysis, oxidation, reduction, racemization, polymerization"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u2",
          "unitNumber": 2,
          "title": "Solid dosage form",
          "hours": 20,
          "marks": 11,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u2-sub-1",
              "label": "a",
              "text": "Tablets:",
              "details": [
                "Introduction, ideal characteristics of tablets, classification of tablets. Excipients, Formulation of tablets, granulation methods, compression and processing problems.",
                "Tablet coating: Describe the reasons for tablets coating and Types of coating, coatin g materials, formulation of coating composition, methods of coating, their merits, demerits and defects in coating.",
                "Quality control tests: In process and finished product tests"
              ]
            },
            {
              "id": "pharmaceutics-2-u2-sub-2",
              "label": "b",
              "text": "Capsule:",
              "details": [
                "Define capsule and mention its types and advantages and disadvantages.",
                "Mention different sizes of Hard and soft gelatin capsule, filling materials in hard and soft gelatin capsule, manufacturing defects and describe method for calculation of filling weight.",
                "Describe different parts and filling procedure of hard gel atin capsule using manual filling machine.",
                "Mention the difference between hard and soft gelatin capsules.",
                "Describe the Packaging, storage and stability testing of soft gelatin capsules and their applications.",
                "Discuss in-process and final product quality control tests for capsules"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u3",
          "unitNumber": 3,
          "title": "Liquid dosage forms",
          "hours": 15,
          "marks": 8,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u3-sub-1",
              "label": "a",
              "text": "Liquid orals: Formulation and manufacturing consideration of syrups and elixirs suspensions and emulsions; Filling and packaging; evaluation of liquid orals official in pharmacopoeia"
            },
            {
              "id": "pharmaceutics-2-u3-sub-2",
              "label": "b",
              "text": "Suspensions: Definition, advantages and disadvantages, classifications, Preparation of suspensions; Flocculated and Deflocculated suspension & stability problems and methods to overcome."
            },
            {
              "id": "pharmaceutics-2-u3-sub-3",
              "label": "c",
              "text": "Emulsions: Definition, classification, emulsifying agent, test for the identification of type of Emulsion, Methods of preparation & stability problems and methods to overcome."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u4",
          "unitNumber": 4,
          "title": "Semisolid dosage forms",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u4-sub-1",
              "label": "",
              "text": "",
              "details": [
                "Definitions, classification, mechanisms and factors influencing dermal penetration of drugs. Preparation of ointments, pastes, creams and gels. Excipients used in semi solid dosage forms. Evaluation of semi solid dosages forms."
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u5",
          "unitNumber": 5,
          "title": "Packaging Materials Science",
          "hours": 3,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u5-sub-1",
              "label": "",
              "text": "Materials used for packaging of pharmaceutical products, factors influencing choice of containers, legal and official requirements for containers, stability aspects of packaging materials, quality control tests."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u6",
          "unitNumber": 6,
          "title": "Pharmaceutical Aerosols",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u6-sub-1",
              "label": "",
              "text": "",
              "details": [
                "Definition, propellants, containers, valves, types of aerosol systems; formulation and manufacture of aerosols; Evaluation of aerosols; Quality control and stability studies."
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u7",
          "unitNumber": 7,
          "title": "Parenteral Products",
          "hours": 15,
          "marks": 8,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u7-sub-1",
              "label": "a",
              "text": "Introduce parenteral preparations with examples."
            },
            {
              "id": "pharmaceutics-2-u7-sub-2",
              "label": "b",
              "text": "Mention its advantages and disadvantages."
            },
            {
              "id": "pharmaceutics-2-u7-sub-3",
              "label": "c",
              "text": "Differentiate between small volume and large volume parenteral."
            },
            {
              "id": "pharmaceutics-2-u7-sub-4",
              "label": "d",
              "text": "Mention formulation components with examples."
            },
            {
              "id": "pharmaceutics-2-u7-sub-5",
              "label": "e",
              "text": "Describe aseptic condition and its need in manufacturing of parenteral preparation."
            },
            {
              "id": "pharmaceutics-2-u7-sub-6",
              "label": "f",
              "text": "Describe the steps involved in manufacturing of parenteral preparation in brief."
            },
            {
              "id": "pharmaceutics-2-u7-sub-7",
              "label": "g",
              "text": "Describe the quality control test for parenteral products. (Sterility, Pyrogen, Particulate matter and leak test of ampoules.)"
            },
            {
              "id": "pharmaceutics-2-u7-sub-8",
              "label": "h",
              "text": "Ophthalmic Preparations: Introduction, formulation considerations; formulation of eye drops, eye ointments and eye lotions; methods of preparation; labeling, containers; evaluation of ophthalmic preparations."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u8",
          "unitNumber": 8,
          "title": "Basic consideration in pharmaceutics",
          "hours": 8,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u8-sub-1",
              "label": "a",
              "text": "Prescription: Definition, Parts of prescription, handling of Prescription and Errors in prescription."
            },
            {
              "id": "pharmaceutics-2-u8-sub-2",
              "label": "b",
              "text": "Posology: Definition, Factors affecting posology. Pediatric dose calculations based on age, body weight and body surface area."
            },
            {
              "id": "pharmaceutics-2-u8-sub-3",
              "label": "c",
              "text": "Pharmaceutical incompatibilities: Definition, classification, physical, chemical and therapeutic incompatibilities with examples."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u9",
          "unitNumber": 9,
          "title": "Powders",
          "hours": 4,
          "marks": 3,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u9-sub-1",
              "label": "",
              "text": "Definition, classification, advantages and disadvantages, Simple & compound powders - official preparations, dusting powders, effervescent, efflorescent and hygroscopic powders, eutectic mixtures. Geometric dilutions."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u10",
          "unitNumber": 10,
          "title": "Suppositories",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u10-sub-1",
              "label": "",
              "text": "Definition, types, advantages and disadvantages, types of bases, methods of preparations, Evaluation of suppositories."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u11",
          "unitNumber": 11,
          "title": "Quality Assurance and Quality Management concepts",
          "hours": 15,
          "marks": 8,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u11-sub-1",
              "label": "a",
              "text": "Define quality control and quality assurance."
            },
            {
              "id": "pharmaceutics-2-u11-sub-2",
              "label": "b",
              "text": "Define is BMR, BPR, MFR, and SOP"
            },
            {
              "id": "pharmaceutics-2-u11-sub-3",
              "label": "c",
              "text": "Enumerate the importance of ISO 9000 and ISO 14000"
            },
            {
              "id": "pharmaceutics-2-u11-sub-4",
              "label": "d",
              "text": "Describe the meaning of quality of drugs."
            },
            {
              "id": "pharmaceutics-2-u11-sub-5",
              "label": "e",
              "text": "Familiarize with GMP and GLP."
            },
            {
              "id": "pharmaceutics-2-u11-sub-6",
              "label": "f",
              "text": "List the key components of total quality management."
            },
            {
              "id": "pharmaceutics-2-u11-sub-7",
              "label": "g",
              "text": "Define calibration and validation"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u12",
          "unitNumber": 12,
          "title": "Cosmetics:",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u12-sub-1",
              "label": "a",
              "text": "Define Cosmetology."
            },
            {
              "id": "pharmaceutics-2-u12-sub-2",
              "label": "b",
              "text": "List various cosmetic preparations"
            },
            {
              "id": "pharmaceutics-2-u12-sub-3",
              "label": "c",
              "text": "Discuss formulation and preparation of following cosmetics",
              "details": [
                "Hair preparations: Shampoos",
                "Skin Preparation: Soap, Sun screen",
                "Dentifrices: Tooth paste, Mouth wash",
                "Colored make up: Lipsticks",
                "Baby cosmetics: Baby powders"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u13",
          "unitNumber": 13,
          "title": "Novel Drug delivery systems",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u13-sub-1",
              "label": "a",
              "text": "Define controlled drug delivery system, advantages and disadvantage"
            },
            {
              "id": "pharmaceutics-2-u13-sub-2",
              "label": "b",
              "text": "Define following drug delivery systems with advantages and disadvantages.",
              "details": [
                "Microencapsulation",
                "Mucosal / Buccal Drug Delivery system,",
                "Implantable Drug Delivery System",
                "Transdermal Drug Delivery Systems:",
                "Nasopulmonary drug delivery system,",
                "Targeted drug Delivery,",
                "Ocular Drug Delivery Systems,",
                "Intrauterine Drug Delivery System",
                "Liposome",
                "Niosomes"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u14",
          "unitNumber": 14,
          "title": "Pilot plant scale up techniques",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u14-sub-1",
              "label": "",
              "text": "Discuss Basic pilot plant scale up consideration for manufacturing solids, semi-solids and Liquid dosage forms."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u15",
          "unitNumber": 15,
          "title": "Technology transfer",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u15-sub-1",
              "label": "",
              "text": "Discuss basic Flow Chart of Technology Transfer in the Pharmaceutical Industry"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmaceutics-2-u16",
          "unitNumber": 16,
          "title": "Layout of pharmaceutical manufacturing plants",
          "hours": 4,
          "marks": 2,
          "subUnits": [
            {
              "id": "pharmaceutics-2-u16-sub-1",
              "label": "",
              "text": "Discuss the layout of pharmaceutical manufacturing plants using suitable examples."
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Preformulation Carryout preformulation studies on paracetamol/asparin/or any other drug",
        "Tablets Preparation and evaluation of Paracetamol tablets",
        "Capsules Preparation and evaluation of hard gelatin capsules (any drug)",
        "Parenteral preparation ● Prepare and supply 0.9% sodium chloride solution. ● Preparation of Calcium Gluconate injection",
        "Quality control test of (as per IP) marketed tablets and capsules",
        "Biphasic pharmaceutical products ● Emulsions a. Prepare Turpentine Liniment b. Prepare Liquid paraffin emulsion ● Suspensions a. Prepare alamine lotion b. Prepare Magnesium Hydroxide mixture c. Prepare Aluminum Hydroxide gel",
        "Cosmetics and Toiletries a. Prepare cold creams and vanishing creams. b. Prepare tooth paste. c. Prepare shaving cream.",
        "Formulation of the following dosage forms a. Syrups: Preparation of simple and compound Syrup IP. b. Solutions: Preparation of hand rub sanitizer (WHO formula) c. Powders d. Preparation of ORS powder (WHO) e. Suppositories Preparation of suppository using different bases (Glycerol and Cocoa butter) ● Semisolids Prepare Whitfield ointment. ● Gargles and Mouthwashes a. Prepare of Iodine gargle b. Preparation of Chlorhexidine mouthwash."
      ],
      "references": [
        "Gaud. Pharmaceutics, 2003, India.",
        "Gaud and Gupta. Practical Pharmaceutics, 2004, India.",
        "Remington: The Science and Practice of Pharmacy, 20th Edition, Vol I & II.",
        "The Theory and Practice of Industrial Pharmacy, Leon Lackman, H. A. Lieberman, J. L. Kanig, Third Edition, Varghese Publishing House, Hind Rajasthan Building, Dadar, Bombay - 400 014.",
        "Pharmaceutics: The Science of Dosage Forms, M. E. Aulton, Churchill Livingstone.",
        "Indian pharmacopeias.",
        "British pharmacopeias. Cooper and Gunn’s Tutorial Pharmacy, Sixth Edition.",
        "B.M. Mittal, R.N. Saha, A hand book of cosmetics, Vallabh Prakashan, Delhi.",
        "Y W. Chien, Novel Drug Deliver y S y stems, 2nd edition, revised and expanded,Marcel Dekker, Inc., New York, 1992.",
        "Robinson, J. R., Lee V. H. L, Controlled Drug DeliverySy stems, Marcel Dekker,Inc., New York, 1992",
        "Harry ’sCosmeticology, Wilkinson, Moore, Seventh Edition, George Godwin.",
        "H.C. Ansel et al., Pharmaceutical Dosage Form and Drug Delivery Sy stem, Lippincott Williams and Walkins, New Delhi.",
        "Carter S.J., Cooper and Gunn’s-Dispensing for Pharmaceutical Students, CBS publishers,New Delhi.",
        "Dilip M. Parikh: Handbook of Pharmaceutical Granulation Technology , Marcel Dekker,I NC, New York."
      ]
    },
    {
      "id": "pharmacology-2",
      "name": "Pharmacology II",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course is designed to help students to acquire the knowledge and skills on drug action, handling by body and therapeutics concerned with the application of pharmacology in prevention and treatment of diseases. This course focuses on the mode of action, the indication and adverse effects, dose, drug interaction, contraindication and precautions to be taken for drugs to be used.",
      "objectives": [
        "Describe the specific action and use of drugs on different body systems.",
        "Discuss the principles of Phamacotherapeutics and drug safety",
        "Know the action, use, mechanism of action, interaction, adverse reactions, and market availability mainly with reference to counseling to patients & care taker on rational use of following drugs:"
      ],
      "units": [
        {
          "id": "pharmacology-2-u1",
          "unitNumber": 1,
          "title": "Cardiovascular drugs",
          "hours": 25,
          "marks": 14,
          "subUnits": [
            {
              "id": "pharmacology-2-u1-sub-1",
              "label": "1.1",
              "text": "Describe Hypertension, Angina, Congestive cardiac Failure, Arrhythmia, Coagulation, Hyperlipidemia, Myocardial infarction"
            },
            {
              "id": "pharmacology-2-u1-sub-2",
              "label": "1.2",
              "text": "Classifications, General mechanism of action, use, side effect, contraindication, precaution and dose of commonly used"
            },
            {
              "id": "pharmacology-2-u1-sub-3",
              "label": "a",
              "text": "Diuretics and anti",
              "details": [
                "diuretics: Frusemide, Hydrochlorothiazide, Spironolactone, Mannitol Acetazolamide, Vasopressin"
              ]
            },
            {
              "id": "pharmacology-2-u1-sub-4",
              "label": "b",
              "text": "Beta Blockers: Atenolol, Metoprolol"
            },
            {
              "id": "pharmacology-2-u1-sub-5",
              "label": "c",
              "text": "Calcium channel Blockers: Amlodipine, Verapamil, Nifedipine"
            },
            {
              "id": "pharmacology-2-u1-sub-6",
              "label": "d",
              "text": "ACE inhibitors: Enalapril, Ramipril"
            },
            {
              "id": "pharmacology-2-u1-sub-7",
              "label": "e",
              "text": "ACE-II inhibitors: Losartan, Telmisartan"
            },
            {
              "id": "pharmacology-2-u1-sub-8",
              "label": "f",
              "text": "Vasodilators: Nitroglycerine"
            },
            {
              "id": "pharmacology-2-u1-sub-9",
              "label": "g",
              "text": "Cardiac glycosides: Digoxin"
            },
            {
              "id": "pharmacology-2-u1-sub-10",
              "label": "h",
              "text": "Lipid lowering: Atorvastatin, Simvastatin, Clofibrate, Fenofibrate"
            },
            {
              "id": "pharmacology-2-u1-sub-11",
              "label": "i",
              "text": "Anti-platelet: Aspirin"
            },
            {
              "id": "pharmacology-2-u1-sub-12",
              "label": "j",
              "text": "Anticoagulantand antagonist: Heparin, Warfarin, Enoxaparin, Phytomenadione, Protamine sulphate"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u2",
          "unitNumber": 2,
          "title": "Histamine and antihistamine",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacology-2-u2-sub-1",
              "label": "2.1",
              "text": "Introduction of Histamine and its actions in body."
            },
            {
              "id": "pharmacology-2-u2-sub-2",
              "label": "2.2",
              "text": "Classifications, General mechanism of action, use, side effect, contraindication, precaution and dose of commonly used"
            },
            {
              "id": "pharmacology-2-u2-sub-3",
              "label": "a",
              "text": "Antihistamines: Chlorpheniramine, Pheniramine, Cetrizine, Levocetr izine, Fexofenadine, Loratidine, Promethazine"
            },
            {
              "id": "pharmacology-2-u2-sub-4",
              "label": "b",
              "text": "Decongestants: Local: Oxymetazoline, Xylometazoline, Nafazoline Systemic: Phenylepherine, Pseudoephedrine"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u3",
          "unitNumber": 3,
          "title": "Hormones and related drugs",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharmacology-2-u3-sub-1",
              "label": "3.1",
              "text": "Classifications, General pharmacological actions, mechanism of action, use, side effect, contraindication, precaution and dose of commonly used"
            },
            {
              "id": "pharmacology-2-u3-sub-2",
              "label": "a",
              "text": "Drugs used in hypothyroidism and hyperthyroidism: Thyroxine, Propylthiouracil, carbimazole"
            },
            {
              "id": "pharmacology-2-u3-sub-3",
              "label": "b",
              "text": "Anti-diabetic d rugs: Insulin, Metformin, Sitagliptin, Linagliptin, Pioglitazone, Glipizide, Gliblenclamide, Glimeperide, Voglibose, Repaglinide"
            },
            {
              "id": "pharmacology-2-u3-sub-4",
              "label": "c",
              "text": "Glucagon"
            },
            {
              "id": "pharmacology-2-u3-sub-5",
              "label": "d",
              "text": "Corticosteroids: Betamethasone, Dexamethasone, Hydrocortisone, Prednisolone,"
            },
            {
              "id": "pharmacology-2-u3-sub-6",
              "label": "e",
              "text": "Androgen and its antagonist: Testesterone, Flutamide, Finasteride"
            },
            {
              "id": "pharmacology-2-u3-sub-7",
              "label": "f",
              "text": "Progesteron, Estrogen, and SERMs(Tamoxifen, Clomiphene citrate)"
            },
            {
              "id": "pharmacology-2-u3-sub-8",
              "label": "g",
              "text": "Female contraceptives: Oral contraceptives, Injectable contraceptives and Implantable contraceptives"
            },
            {
              "id": "pharmacology-2-u3-sub-9",
              "label": "h",
              "text": "Oxytocin"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u4",
          "unitNumber": 4,
          "title": "Drugs acting on peripheral nervous system",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacology-2-u4-sub-1",
              "label": "",
              "text": "Classifications, General pharmacological actions, mechanism of action, use, side effect, contraindication, precaution and dose of commonly used"
            },
            {
              "id": "pharmacology-2-u4-sub-2",
              "label": "a",
              "text": "Skeletal muscle relaxant drugs: Suxamethonium, Tizanidine, Atracurium,"
            },
            {
              "id": "pharmacology-2-u4-sub-3",
              "label": "b",
              "text": "Local anaesthetics: Lignocaine, Procaine, Oxythiazine"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u5",
          "unitNumber": 5,
          "title": "Drugs acting on central nervous system",
          "hours": 30,
          "marks": 17,
          "subUnits": [
            {
              "id": "pharmacology-2-u5-sub-1",
              "label": "5.1",
              "text": "Classifications, General pharmacological actions, mechanism of action, use, side effect, contraindication, precaution and dose of commonly used"
            },
            {
              "id": "pharmacology-2-u5-sub-2",
              "label": "a",
              "text": "General anesthetics: Nitrous Oxide, Halothane, Ketamine, Propofol"
            },
            {
              "id": "pharmacology-2-u5-sub-3",
              "label": "b",
              "text": "Sedatives-hypnotics: Diazepam, Alprazolam, Zolpidem, Phenobarbitone, Chlordiazepoxide"
            },
            {
              "id": "pharmacology-2-u5-sub-4",
              "label": "c",
              "text": "Antiepileptic drugs: Carbamazepine, Phenytoin, Valproic Acid, Ethosuximide"
            },
            {
              "id": "pharmacology-2-u5-sub-5",
              "label": "d",
              "text": "Antiparkinsonian drugs: Levodopa, Carbidopa"
            },
            {
              "id": "pharmacology-2-u5-sub-6",
              "label": "e",
              "text": "Opoid analgesics and antagonists: Morphine, Pethidine, Codeine, Naloxone"
            },
            {
              "id": "pharmacology-2-u5-sub-7",
              "label": "f",
              "text": "Antipsychotic, antimanic and antidepressant drugs: Fluoxetine, Amitryptylline, Chlorpromazine, Haloperidol, lithium salts"
            },
            {
              "id": "pharmacology-2-u5-sub-8",
              "label": "5.2",
              "text": "Management of migraine headache: Ergometrine, Triptans (Sumatriptan, Rizatriptan, Zolmitriptan)"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u6",
          "unitNumber": 6,
          "title": "Chemotherapy and neoplastic drugs",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacology-2-u6-sub-1",
              "label": "6.1",
              "text": "Mechanism of action, use, side effect, contraindication, precaution and dose of commonly used anticancer drugs: Cyclophosphamide, Methotrexate, Doxorubicin, Bl eomycine, Paclitaxel, Vincristine, Mercaptopurine, Cytarabine, and Cisplatin)"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u7",
          "unitNumber": 7,
          "title": "Drugs acting on skin and mucous membrane",
          "hours": 15,
          "marks": 9,
          "subUnits": [
            {
              "id": "pharmacology-2-u7-sub-1",
              "label": "7.1",
              "text": "Definition, examples and Uses of following"
            },
            {
              "id": "pharmacology-2-u7-sub-2",
              "label": "a",
              "text": "Demulcents"
            },
            {
              "id": "pharmacology-2-u7-sub-3",
              "label": "b",
              "text": "Emollients"
            },
            {
              "id": "pharmacology-2-u7-sub-4",
              "label": "c",
              "text": "Adsorbents and protectives"
            },
            {
              "id": "pharmacology-2-u7-sub-5",
              "label": "d",
              "text": "Astringents"
            },
            {
              "id": "pharmacology-2-u7-sub-6",
              "label": "e",
              "text": "Irritants and counter irritants"
            },
            {
              "id": "pharmacology-2-u7-sub-7",
              "label": "f",
              "text": "Keratolytics"
            },
            {
              "id": "pharmacology-2-u7-sub-8",
              "label": "g",
              "text": "Antiseborrheics"
            },
            {
              "id": "pharmacology-2-u7-sub-9",
              "label": "h",
              "text": "Antipsoriasis"
            },
            {
              "id": "pharmacology-2-u7-sub-10",
              "label": "i",
              "text": "Drugs for acne vulgaris"
            },
            {
              "id": "pharmacology-2-u7-sub-11",
              "label": "j",
              "text": "Antiseptic and disinfectant with their classification and spectrum of activity"
            },
            {
              "id": "pharmacology-2-u7-sub-12",
              "label": "k",
              "text": "Drugs used in scabies and pediculosis"
            },
            {
              "id": "pharmacology-2-u7-sub-13",
              "label": "l",
              "text": "Single versus combination therapy for management of skin disease"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u8",
          "unitNumber": 8,
          "title": "Lists different types of Eye, ear and nasal preparation",
          "hours": 3,
          "marks": 2,
          "subUnits": [],
          "completed": false
        },
        {
          "id": "pharmacology-2-u9",
          "unitNumber": 9,
          "title": "Toxicology: with emphasis on Organophosphorus, Paracetamol, Barbiturates, Opioids, Heavy metal poisoning",
          "hours": 5,
          "marks": 3,
          "subUnits": [],
          "completed": false
        },
        {
          "id": "pharmacology-2-u10",
          "unitNumber": 10,
          "title": "List of life saving and emergency drugs",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacology-2-u10-sub-1",
              "label": "",
              "text": "Classification according to the condition they used"
            },
            {
              "id": "pharmacology-2-u10-sub-2",
              "label": "a",
              "text": "Drugs used in Anaphylactic shock"
            },
            {
              "id": "pharmacology-2-u10-sub-3",
              "label": "b",
              "text": "Drugs used in Myocardial infarction and cardiogenic shock"
            },
            {
              "id": "pharmacology-2-u10-sub-4",
              "label": "c",
              "text": "Drugs used in peripheral circulatory collapse"
            },
            {
              "id": "pharmacology-2-u10-sub-5",
              "label": "d",
              "text": "Drugs used in status epilepticus"
            },
            {
              "id": "pharmacology-2-u10-sub-6",
              "label": "e",
              "text": "Medicines for Hypertensive Crisis"
            },
            {
              "id": "pharmacology-2-u10-sub-7",
              "label": "f",
              "text": "Antisnake venom for snake bite"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacology-2-u11",
          "unitNumber": 11,
          "title": "Urinary acidifiers and alkalizers",
          "hours": 2,
          "marks": 1,
          "subUnits": [],
          "completed": false
        }
      ],
      "practicals": [
        "Identify commonly used Apparatus/instruments in experimental pharmacology",
        "Discuss different routes of drugs administration in mice/rats.",
        "Prepare stock solutions of drugs and their dilutions and calculation of dose of a drug to be administered.",
        "Identify Anesthetics used for animal studies, and procedures for rendering animal unconscious and chemical euthanasia.",
        "Perform experiments on spontaneous motor activity (Using Rota Rod) (8Hrs)",
        "Perform dose calculation of special population.",
        "Theory related case studies (minimum 10 case studies)",
        "Prepare drug profile of theory related commonly used drugs (minimum 20)"
      ],
      "references": [
        "Goodman G. A, Rall, T.W, Nies A.I.S, Taylor P. Goodman and Gilman’s The pharmacological Basis of therapeutics. McGraw Hill, Pergamon press.",
        "Craig, C.R, Stitzel R.E. Modern Pharmacology. Little Brown Co.",
        "Katzung B.G. Basic & Clinical Pharmacology. Churchill Livingstone New York",
        "Tripathi K. D. Essentials of medical pharmacology. Jaypee, Delhi.",
        "Rang H.P, Dale M.M. Pharmacology. Churchill Living stone.",
        "Satoskar R.S, Bhadarkar S.D. Pharmacology and pharmacotherapeutics. Popular, Dubai.",
        "Kulkarni S.K. Hand Book of Experimental Pharmacology. Vallabh Prakashan, Delhi.",
        "Grover J.K. Experiments in Pharmacy & Pharmacology. CBS Publishers, New Delhi."
      ]
    },
    {
      "id": "pharm-chem-2",
      "name": "Pharmaceutical Chemistry II",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course provides knowledge and skills on physic-chemical properties of organic pharmaceutical ingredients and biological action in relation to their chemical structure and recommended method/s of their quality control.",
      "objectives": [
        "Understand the organic pharmaceutical ingredients, their official monographs and articles.",
        "Explain nomenclature of organic compounds with special reference to heterocyclic system.",
        "Explain chemical classification, structure, chemistry, physical properties, stability and storage of the organic drug molecules."
      ],
      "units": [
        {
          "id": "pharm-chem-2-u1",
          "unitNumber": 1,
          "title": "Introduction to pharmaceutical chemistry",
          "hours": 10,
          "marks": 5,
          "subUnits": [
            {
              "id": "pharm-chem-2-u1-sub-1",
              "label": "1.1",
              "text": "Describe the importance of organic drug molecules as a whole; focused in pharmacy."
            },
            {
              "id": "pharm-chem-2-u1-sub-2",
              "label": "1.2",
              "text": "Discuss the brief history of the development of pharmaceutical chemistry."
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-2-u2",
          "unitNumber": 2,
          "title": "Nomenclature of organic compounds with special reference to heterocyclic system",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharm-chem-2-u2-sub-2",
              "label": "2.1",
              "text": "Discuss the IUPAC Nomenclature of aliphatic Hydrocarbons and Hydrocarbons with functional groups"
            },
            {
              "id": "pharm-chem-2-u2-sub-3",
              "label": "a",
              "text": "IUPAC rule of nomenclature for heterocyclic ring up to seven membered rings."
            },
            {
              "id": "pharm-chem-2-u2-sub-4",
              "label": "b",
              "text": "Common heterocyclic rings with example of drugs belonging to the group: Azine, Azepine, Hydantoin, Pyridine, Piperidine, Quinoline, isoquinoline, coumarine, Purine, Tropine, Pyrazine, Pyrimidine, Pyrrole, Imidazoline, Uracil, Thiazole, Thiazolidine, furan, pyrrolidine, indole, penam and cepham."
            },
            {
              "id": "pharm-chem-2-u2-sub-5",
              "label": "2.2",
              "text": "Definition, characteristics of aromatic compounds, Huckel’s rule, structure of benzene, isomerism and orientation of benzene derivatives, uses of benzene."
            },
            {
              "id": "pharm-chem-2-u2-sub-6",
              "label": "2.3",
              "text": "Discuss the numbering system of different position of benzene ring."
            }
          ],
          "completed": false
        },
        {
          "id": "pharm-chem-2-u3",
          "unitNumber": 3,
          "title": "Chemical classification Structure, Chemistry(Chemistry of only those compounds marked with asterisk), Physical Properties, stability, storage and uses of the molecules of following organic drugs, unless specified (from section 3.1 to 3.18)",
          "hours": 110,
          "marks": 65,
          "subUnits": [
            {
              "id": "pharm-chem-2-u3-sub-1",
              "label": "",
              "text": "Chemistry refers to the explanation of the structure (their ring system present, functional groups and the side chains present in the structure)."
            },
            {
              "id": "pharm-chem-2-u3-sub-2",
              "label": "",
              "text": "Physical properties required only of the parent molecule unless name of the salt is mentioned in the syllabus."
            },
            {
              "id": "pharm-chem-2-u3-sub-3",
              "label": "3.1",
              "text": "Antiseptics and disinfectants [10Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-4",
              "label": "a",
              "text": "Formaldehyde, Acriflavine, Proflavine*, Benzalkonium chloride, Cetrimideand cresol*.Chlorocresol , Chloroxylenol"
            },
            {
              "id": "pharm-chem-2-u3-sub-5",
              "label": "b",
              "text": "Sulfonamides: Co-trimoxazole*, Sulfadiazine*, Sulphaguanidine, Sulphacetamide*"
            },
            {
              "id": "pharm-chem-2-u3-sub-6",
              "label": "3.2",
              "text": "Penicillins and Cephalosporins: [7Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-7",
              "label": "a",
              "text": "Benzylpenicillin, Ampicillin, Amoxicillin*, Clavulanic Acid."
            },
            {
              "id": "pharm-chem-2-u3-sub-8",
              "label": "b",
              "text": "Cephalexin*, Cefaclor, Cefadroxil, Cefixime, Ceftriaxone."
            },
            {
              "id": "pharm-chem-2-u3-sub-9",
              "label": "3.3",
              "text": "Chloramphenicol and Tetracycline [5Hrs]",
              "details": [
                "Chloramphenicol*, Tetracycline* and Doxycycline."
              ]
            },
            {
              "id": "pharm-chem-2-u3-sub-10",
              "label": "3.4",
              "text": "Aminoglycosides and Macrolides [5Hrs]",
              "details": [
                "Erythromycin, Gentamicin*, Azithromycin*."
              ]
            },
            {
              "id": "pharm-chem-2-u3-sub-11",
              "label": "3.5",
              "text": "Quinolones and fluoroquinolones&Drugs Acting on UTI [5 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-12",
              "label": "a",
              "text": "Nitrofurantoin*"
            },
            {
              "id": "pharm-chem-2-u3-sub-13",
              "label": "b",
              "text": "Nalidixic acid, Ciprofloxacin*, Norfloxacin, Ofloxacin*."
            },
            {
              "id": "pharm-chem-2-u3-sub-14",
              "label": "3.6",
              "text": "Antimycobacterial medicines [5Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-15",
              "label": "a",
              "text": "Antituberculars- INH*, Rifampicin, Ethambutol*, Pyrizinamide*, Streptomycin and PAS"
            },
            {
              "id": "pharm-chem-2-u3-sub-16",
              "label": "b",
              "text": "Anti-leprotics: Dapsone* and Clofazemine*."
            },
            {
              "id": "pharm-chem-2-u3-sub-17",
              "label": "3.7",
              "text": "Anti-amoebic and Anthelmentics [10Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-18",
              "label": "a",
              "text": "Metronidazole*, Tinidazole, Secnidazole"
            },
            {
              "id": "pharm-chem-2-u3-sub-19",
              "label": "b",
              "text": "Albendazole*, Diloxanide-fuorate*, DEC*"
            },
            {
              "id": "pharm-chem-2-u3-sub-20",
              "label": "c",
              "text": "Anti-malarials: Quinine group (Chloroquine* and Mefloquine)."
            },
            {
              "id": "pharm-chem-2-u3-sub-21",
              "label": "3.8",
              "text": "Scabicides and pediculocides [4Hrs]",
              "details": [
                "GBHC, Benzyl benzoate, Permethrin"
              ]
            },
            {
              "id": "pharm-chem-2-u3-sub-22",
              "label": "3.9",
              "text": "Drugs Acting on CNS [20Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-23",
              "label": "a",
              "text": "Antipsycotics - Chlorpromazine*, Haloperidol*,"
            },
            {
              "id": "pharm-chem-2-u3-sub-24",
              "label": "b",
              "text": "Anxiolytics - Diazepam*, Lorazepam, Nitrazepam, Alprazolam*"
            },
            {
              "id": "pharm-chem-2-u3-sub-25",
              "label": "c",
              "text": "Hypnotics - Phenobarbitone*"
            },
            {
              "id": "pharm-chem-2-u3-sub-26",
              "label": "d",
              "text": "Anti-depressants - Amitryptilline*, Imipramine"
            },
            {
              "id": "pharm-chem-2-u3-sub-27",
              "label": "e",
              "text": "Antiepileptics and Anticonvoulsants: Carbamazepine*, Phenytoin*, Sodium Valproate"
            },
            {
              "id": "pharm-chem-2-u3-sub-28",
              "label": "f",
              "text": "Antiparkinsons: Levodopa*, Carbidopa"
            },
            {
              "id": "pharm-chem-2-u3-sub-29",
              "label": "3.10",
              "text": "Anesthetics [2Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-30",
              "label": "a",
              "text": "General anaesthetics: Halothane, Ketamine*."
            },
            {
              "id": "pharm-chem-2-u3-sub-31",
              "label": "b",
              "text": "Local Anaesthetics: Lignocaine*, Benzocaine."
            },
            {
              "id": "pharm-chem-2-u3-sub-32",
              "label": "3.11",
              "text": "Drugs Acting on ANS [6Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-33",
              "label": "a",
              "text": "Cholinergic Agonists: Neostigmine*, Pyridostigmine, Pilocarpine*."
            },
            {
              "id": "pharm-chem-2-u3-sub-34",
              "label": "b",
              "text": "Cholinergic Antagonists: Atropine*, Hyoscine*, Tropicamide, Pralidoxime*."
            },
            {
              "id": "pharm-chem-2-u3-sub-35",
              "label": "c",
              "text": "Adrenergic Agonists: Adrenaline*, Noradrenaline, Salbutamol* and Pseudoephedrine."
            },
            {
              "id": "pharm-chem-2-u3-sub-36",
              "label": "d",
              "text": "Adrenergic Antagonists: Propranolol*, Atenolol*."
            },
            {
              "id": "pharm-chem-2-u3-sub-37",
              "label": "e",
              "text": "Muscle relaxants: Chlorzoxazone*, Tizanidine."
            },
            {
              "id": "pharm-chem-2-u3-sub-38",
              "label": "3.12",
              "text": "Cardiovascular Drugs: [7 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-39",
              "label": "a",
              "text": "Frusemide*, Hydrochlorothiazide*, Mannitol*"
            },
            {
              "id": "pharm-chem-2-u3-sub-40",
              "label": "b",
              "text": "Amlodipine*, Enalapril*, Losartan*, Digoxin*, Atorvastatin*."
            },
            {
              "id": "pharm-chem-2-u3-sub-41",
              "label": "c",
              "text": "Nitrate anti-anginals: Nitroglycerine*"
            },
            {
              "id": "pharm-chem-2-u3-sub-42",
              "label": "d",
              "text": "Quinidine, Procainamide*"
            },
            {
              "id": "pharm-chem-2-u3-sub-43",
              "label": "e",
              "text": "Heparin*, Warfarin*, Ticlopidine, Aspirin"
            },
            {
              "id": "pharm-chem-2-u3-sub-44",
              "label": "3.13",
              "text": "Hormones and Related drugs: [4Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-45",
              "label": "a",
              "text": "Drugs used in Diabetes: Insulin, Glimipride, Glicazide , Metformin*, Pioglitazone*"
            },
            {
              "id": "pharm-chem-2-u3-sub-46",
              "label": "b",
              "text": "Drugs used in Thyroid disorders: Thyroxine*, Carbimazole*, Methylthiouracil"
            },
            {
              "id": "pharm-chem-2-u3-sub-47",
              "label": "c",
              "text": "Steroids: Testosterone*, Estradiol*, Progesterone, Levonorgestrel*, Prednisolone*, Betamethasone and Dexamethasone"
            },
            {
              "id": "pharm-chem-2-u3-sub-48",
              "label": "3.14",
              "text": "Antihistamines: [2 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-49",
              "label": "a",
              "text": "Chlorpheniramine* and Cetrizine*"
            },
            {
              "id": "pharm-chem-2-u3-sub-50",
              "label": "b",
              "text": "Promethazine*, Cyproheptadine and Fexofenadine*."
            },
            {
              "id": "pharm-chem-2-u3-sub-51",
              "label": "3.15",
              "text": "Analgesic, Anti-pyretic and NSAID: [4 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-52",
              "label": "a",
              "text": "Morphine*, Codeine*, Pethidine, Tramadol and Fentanyl"
            },
            {
              "id": "pharm-chem-2-u3-sub-53",
              "label": "b",
              "text": "Classify NSAIDs Paracetamol*, Ibuprofen*, Diclofenac*, Mefenamic acid*."
            },
            {
              "id": "pharm-chem-2-u3-sub-54",
              "label": "3.16",
              "text": "Anti-neoplastic: [6 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-55",
              "label": "",
              "text": "Cisplatin*, Mercaptopurine, Fluorouracil, Vincristine, Taxol, Doxorubicin*, Mitomycin, Methotrexate*, Cyclophosphamide"
            },
            {
              "id": "pharm-chem-2-u3-sub-56",
              "label": "3.17",
              "text": "Vitamins, Minerals and Enzymes: [5 Hrs.]"
            },
            {
              "id": "pharm-chem-2-u3-sub-57",
              "label": "a",
              "text": "Structure and uses of:Vitamin A, Vitamin B group (Thiamine, Niacinamide, D-panthenol, Pyridoxine, Riboflavin, Cyano-cobalamine, Folic Acid), Vitamin C, Vitamin D, Vitamin E, Vitamin K."
            },
            {
              "id": "pharm-chem-2-u3-sub-58",
              "label": "b",
              "text": "Uses of: Diastase, Pepsin, Pancreatin, Serratiopeptidase, Chymotrypsine"
            },
            {
              "id": "pharm-chem-2-u3-sub-59",
              "label": "3.18",
              "text": "Diagnostics: [2Hrs]"
            },
            {
              "id": "pharm-chem-2-u3-sub-60",
              "label": "",
              "text": "Iopanoicacid, Propyliodone, Meglumine"
            },
            {
              "id": "pharm-chem-2-u3-sub-61",
              "label": "3.19",
              "text": "Synthesis of Paracetamol, Chorpromazine, Aspirin and Isoniazid [2Hrs]"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Prepare different concentration solutions from given solid powder and convert the concentration in different terms.",
        "Prepare different concentration solutions from given liquid sample and convert the concentration in different terms.",
        "Prepare stock solution from concentrated laboratory reagent and prepare different dilute solutions from it.",
        "Prepare stock solution from solid powder and prepare different dilute solutions from it.",
        "Prepare very dilute solution using concentrated solution by serial dilution method.",
        "Prepare different parts per million solutions of different salts.",
        "Prepare parts per million solutions of different cations using available salts",
        "Prepare parts per million solutions of different anions using available salts.",
        "Determine the melting point of given organic drug sample using melting point apparatus.",
        "Extract Metronidazole from its tablet dosage form using pharmacopoeia",
        "Extract Paracetamol from is tablet dosage form using pharmacopoeia.",
        "Extract ibuprofen from its tablet dosage form using pharmacopoeia.",
        "Prepare and standardize 0.1 N sodium hydroxide solution using oxalic acid primary standard solution.",
        "Perform the assay of ibuprofen by acid-base titration using previously standardized Sodium Hydroxide solution.",
        "Determine the concentration of given unknown acid solution using a primary standard solution of Sodium Carbonate.",
        "Determine the concentration of given unknown alkaline solution using a primary standard solution of Oxalic acid.",
        "Perform the identification tests of aspirin and paracetamol.",
        "Perform the identification tests of Diclofenac Sodium and Metformin Hydrochloride.",
        "Determine the solubility of given drug samples in different solvents"
      ],
      "references": [
        "Mahadik KR and Kucher BS- Concise inorganic Pharmaceutical chemistry, NiraliPrakashan, 2004.",
        "Mahadik KR and Kucher BS- Concise organic Pharmaceutical chemistry, NiraliPrakashan, 2004.",
        "Kasture AV and Wadker- Pharmaceutical chemistry I & II Nirali Prakashan.",
        "Bekeet AH and Stenlk- Practical Pharmaceutical Chemistry 4th edition Part I & II.",
        "Antheron LM-Bently’s& Drivers text book of Pharmaceutical chemistry, Oxford",
        "University Press London.",
        "Kadam et.al - Principles of Medicinal Chemistry Vol.I& II.",
        "Kasture AV et.al - Pharmaceutical analysis Vol I & II, Nirali Prakashan.",
        "Daniel C Harris- Quantitive Chemical Analysis, W H Freeman and Company.",
        "Jeffrey GH et.al-Vogel’s Textbook of Quantitative Chemical Analysis 5th Edition.",
        "Tipins HP Dhake AS- Inorganic Pharmaceutical chemistry, Career publication, Dec 2002.",
        "Belsare P and Dhake AS- Inorganic Chemistry",
        "Indian Pharmacopoeia latest edition.",
        "British Pharmacopoeia latest edition."
      ]
    },
    {
      "id": "hospital-clinical",
      "name": "Hospital and Clinical Pharmacy",
      "theoryHours": 3,
      "practicalHours": 2,
      "totalHours": 5,
      "creditHours": 4,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course deals with clinical and hospital pharmacy services with particular reference to patient care and related drug indication and its safety.",
      "objectives": [
        "Provide expert services in all aspects of pharmaceutical care through hospital and clinical services.",
        "Work with the other health care professionals in patient care settings including evaluation and counseling for better outcome of pharmacotherapy.",
        "Participate with other members of health care team in clinical trials and other research related to drug indication.",
        "Work as an efficient team member in establishing and managing of ADR surveillance, drug information, dissemination, drug and therapeutic committee and formulary system."
      ],
      "units": [
        {
          "id": "hospital-clinical-u1",
          "unitNumber": 1,
          "title": "Hospital Pharmacy",
          "hours": 60,
          "marks": 40,
          "subUnits": [
            {
              "id": "hospital-clinical-u1-sub-1",
              "label": "",
              "text": "After the completion of the course, students will be able to"
            },
            {
              "id": "hospital-clinical-u1-sub-2",
              "label": "a",
              "text": "Define Hospital and its classification based on various criteria, health care delivery system in Nepal. b Define hospital pharmacy and explain the following:",
              "details": [
                "Organizational structure of hospital pharmacy.",
                "Roles and Responsibilities of a hospital pharmacist. c Discuss Drug and Therapeutic committee, its constitution and functions. d Discuss Hospital formulary and Standard Treatment Guidelines: contents, preparation and its revision. e Discuss Drug distribution systems in hospitals: types of drug distribution systems, dispensing to outpatients, ambulatory patients and inpatients. f Explain Central sterile supply unit and Flow chart of CSSD",
                "Types of material for sterilization. g Define DIC. Discuss Drug and poison information services and sources. h Describe nuclear pharmacy: Clinical applications of radiopharmaceuticals, radiation hazards and their prevention. i Define suture and ligature with classification. j Discuss surgical and medical devices. k Explain total parenteral nutrition (TPN) (definition, composition, classification and application) l Discus computer application in Hospital Pharmacy"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "hospital-clinical-u2",
          "unitNumber": 2,
          "title": "Clinical Pharmacy",
          "hours": 60,
          "marks": 40,
          "subUnits": [
            {
              "id": "hospital-clinical-u2-sub-1",
              "label": "",
              "text": "After the completion of the course, students will be able to a Define and give a brief account of the history and development of clinical pharmacy. b List and explain the role responsibilities and the activities of clinical pharmacist:"
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Demonstrate Indication of Glucometers Insulin Devices, Inhaler, Rotahalers, pregnancy test kits, ECP, suppository, eye and ear drop, Nebulizer, Metered dose inhaler.",
        "Handle and indication data processing software and equipment.",
        "Identify Emergency drug list in Hospital Formulary",
        "Discuss Indication, dose, side effects, contraindications, special precautions and mode of indication of these ER drugs.",
        "Perform discussion by the students in small groups on different case studies related to antibiotic dispensing and counseling and presentation in the class",
        "Identify list of commonly used drugs that are well known to caindication skin reactions",
        "Perform practical examples and exercises on pediatric drug dose calculation",
        "Demonstrate Treatment Card (Cardex) and Nurse Drug Administration Chart (at the back of the Cardex)",
        "Explain Drugs used in treating TB, standard treatment regimens recommended by National Tuberculosis Centre, importance of DOTS",
        "Prepare Immunization schedule as per EPI.",
        "Case study on TDM of some drugs ( at least three common drugs)",
        "Perform Patient counseling (Hypertension, CHF, AMI, Asthma, Epilepsy, DM, PUD, RA psychiatric disorder)",
        "Identify and correct incompatibilities in prescriptions.",
        "Analyze prescriptions for drug interactions, over dosage.",
        "Prepare drug packaging inserts",
        "Evaluate surgical dressings & surgical instruments, glass wares and other hospital supplies.",
        "Perform Total Parenteral Nutrition calculations."
      ],
      "references": [
        "Walker R, Edwards C. Clinical pharmacy and therapeutics, churchil Livingstone. London.",
        "Patil D. J. Hospital and Clinical Pharmacy. NiraliPrakashan; 2008.",
        "Paradkar A. R. Hospital and Clinical Pharmacy. Pragati Books Pvt. Ltd.",
        "Fell J. C, Allwood M. C. Textbook of hospital pharmacy. Blackwell scientific publications.",
        "Stephens M. Hospital pharmacy. Pharmaceutical Press.",
        "Whittlesea C, Hodson K. Clinical Pharmacy and Therapeutics E-Book. Elsevier Health Sciences.",
        "Fell J. C, Allwood M. C. Textbook of hospital pharmacy. Blackwell scientific publications."
      ]
    },
    {
      "id": "pharma-jurisprudence",
      "name": "Pharmaceutical Jurisprudence and Community Pharmacy Practice",
      "theoryHours": 4,
      "practicalHours": 2,
      "totalHours": 6,
      "creditHours": 5,
      "theoryMarks": 80,
      "practicalMarks": 30,
      "totalMarks": 150,
      "description": "This course gives brief knowledge of communication skills, rational drug uses, prescription handling, patient counseling and compliance, health education and competencies for community pharmacists.",
      "objectives": [
        "Acquire knowledge, attitude and practicing skills required for social and administrative pharmacy.",
        "Describe standard / defined pharmaceutical care in the community and social context."
      ],
      "units": [
        {
          "id": "pharma-jurisprudence-u1",
          "unitNumber": 1,
          "title": "Community Pharmacy",
          "hours": 20,
          "marks": 10,
          "subUnits": [
            {
              "id": "pharma-jurisprudence-u1-sub-1",
              "label": "a",
              "text": "Introduction, and scope of community pharmacy"
            },
            {
              "id": "pharma-jurisprudence-u1-sub-2",
              "label": "b",
              "text": "Describe roles and responsibilities of Community pharmacist"
            },
            {
              "id": "pharma-jurisprudence-u1-sub-3",
              "label": "c",
              "text": "Discuss location analysis and layout design of community pharmacy."
            },
            {
              "id": "pharma-jurisprudence-u1-sub-4",
              "label": "d",
              "text": "Describe community Pharmacy Management according GPP guidelines (Premises, personnel, material, equipment and documentation)"
            },
            {
              "id": "pharma-jurisprudence-u1-sub-5",
              "label": "e",
              "text": "Develop communication skills with particular reference to advis ing patient on the appropriate use of medicines."
            },
            {
              "id": "pharma-jurisprudence-u1-sub-6",
              "label": "f",
              "text": "Discuss Barriers to communication."
            },
            {
              "id": "pharma-jurisprudence-u1-sub-7",
              "label": "g",
              "text": "Describe the Label and Labeling of Dispensed medicines."
            },
            {
              "id": "pharma-jurisprudence-u1-sub-8",
              "label": "h",
              "text": "Discuss Patient Counseling and Compliance."
            },
            {
              "id": "pharma-jurisprudence-u1-sub-9",
              "label": "i",
              "text": "Discuss Drug Use Evaluation and WHO drug Use Indicators."
            }
          ],
          "completed": false
        },
        {
          "id": "pharma-jurisprudence-u2",
          "unitNumber": 2,
          "title": "Basic procedures and First aid",
          "hours": 55,
          "marks": 30,
          "subUnits": [
            {
              "id": "pharma-jurisprudence-u2-sub-1",
              "label": "",
              "text": "a Introduction of first aid and emergency care. General principle and importance of first aid management. b Explain procedures of taking temperature Condition for taking oral, axillary, groin and rectal temperature. c Discuss method of taking pulse. Sites to take pulse. Condition causing variation, d Discuss method of counting respiration. Conditions causing variation. e Discuss method of taking B.P. Normal blood pressure in different age groups. Conditions causing variation. f Explain types, procedure, indications, required materials and importance of dressing bandage and splint. Process of removing. Methods of disposing. g Introduction, methods, route and importance of injection. Sites of giving injections. Possible complication of injection. h Discuss required materials and methods of giving IV cannulation. Sites of giving IV cannulation. Precaution i Introduction, indication and importance of suturing. Types of suturing. Process of suturing. Removal of suturing. j Discus definition, Type, Indication, procedure and material of catheterization. Care of the catheter. Contraindication. k Explain and demonstrate first aid management of the following emergency condition",
              "details": [
                "CPR",
                "Shock",
                "Poisoning (insecticides, rodenticides, drugs, alcohols, plants, animal bites and sting).",
                "Snake bite",
                "Fracture and dislocations",
                "Haemorrhage",
                "High fever",
                "Burns",
                "Frostbite",
                "Heatstroke",
                "Rabid animal bites",
                "Drowning",
                "Acute mountain sickness",
                "Epistaxis",
                "Seizures",
                "Loss of consciousness",
                "Foreign body (Eye, Nose, Ear)"
              ]
            }
          ],
          "completed": false
        },
        {
          "id": "pharma-jurisprudence-u3",
          "unitNumber": 3,
          "title": "Pharmaceutical jurisprudence",
          "hours": 65,
          "marks": 40,
          "subUnits": [
            {
              "id": "pharma-jurisprudence-u3-sub-1",
              "label": "",
              "text": "Course Description: This course gives a brief knowledge of legal and ethical aspects of pharmacy practice including national and international rules and regulations and their enforcing bodies. This also includes pharmaceutical ethics and the codes of conduct for pharmacists and skills for regulatory affairs. Course Objectives: After completion of this unit, students will be able to:"
            },
            {
              "id": "pharma-jurisprudence-u3-sub-2",
              "label": "a",
              "text": "Describe the legal system related to different areas of pharmacy practice (Manufacturing, sale distribution, use and control)"
            },
            {
              "id": "pharma-jurisprudence-u3-sub-3",
              "label": "b",
              "text": "Gain the skills for applying the drug-related legislation, regulation pertaining to pharmaceutical products & practices. 1: Introduction to Jurisprudence: [3 Hrs.] After the completion of this unit, students will be able to: a Define & discuss objectives and principle of Jurisprudence b Discuss history of pharmaceutical legislation. c List health Related provisions in Constitution of Nepal. 2: Acts, Regulation and Codes [16 Hrs.[ After completion of this unit, students will be able to: a Give a brief account of recent Drug Act in Nepal and the rules Regulations, Codes and institutions",
              "details": [
                "Drug Act",
                "Drug Consultative and Advisory rule"
              ]
            }
          ],
          "completed": false
        }
      ],
      "practicals": [
        "Adepu R. Community Pharmacy Practice. PharmaMed Press/BSP Books.",
        "Rutter P, Newby D. Community Pharmacy. Elsevier Health Sciences.",
        "Gupta A.K. Handbook of Health Education and Community Pharmacy. CBS Publishers & Distributors.",
        "Saini R. TheTextbook Community Pharmacy. New Age International Pvt Ltd.",
        "Gokhale S.B. Gokhale A. Dispensing and Community Pharmacy. NiraliPrakashan.",
        "WHO Publications: Role of Pharmacist in Health Care, Good Pharmacy Practice, Operational principle for good procurement practice, WHO Revised drug strategies, etc.",
        "Le T, Bhushan V, Sochat M, Kallianos K, Chavda Y, Zureick AH, Kalani M. First aid for the USMLE step 1 2015. New York: McGraw-Hill Medical.",
        "Jones S.A. First Aid, Survival, and CPR: Home and Field Pocket Guide. F.A. Davis Company.",
        "Different Act, Regulations, Codes and Guidelines of Nepal and other countries National Drug Policy",
        "Practical Exercise in Pharmacy, Laws and Ethics. Appelbe GE and Wingfield J, The Pharmaceutical Press.",
        "Essential Drugs WHO Publications:",
        "Guidelines for Safe Disposal of Pharmaceutical Wastes.",
        "Dumetriu H. Good Drug Regulatory Practices-A Regulatory Affairs Quality Manual. CRC Press",
        "Websites: fda.org, wipo.int, patentlawlinks.com, hc-sc.gc.ca, ich.org"
      ],
      "references": []
    },
    {
      "id": "pharmacotherapeutics-2",
      "name": "Pharmacotherapeutics II",
      "theoryHours": 4,
      "practicalHours": 0,
      "totalHours": 4,
      "creditHours": 4,
      "theoryMarks": 80,
      "practicalMarks": 0,
      "totalMarks": 100,
      "description": "This course is designed to impart knowledge and skills necessary for contribution to quality use of medicines. This will enable the student to describe the i ntroduction, clinical manifestation and pathophysiology of common diseases and their management.",
      "objectives": [
        "specific parameters relevant in initiating drug therapy, and monitoring therapy (including alternatives, time",
        "course of clinical and laboratory indices of therapeutic response and adverse effects)."
      ],
      "units": [
        {
          "id": "pharmacotherapeutics-2-u1",
          "unitNumber": 1,
          "title": "Cardiovascular system",
          "hours": 15,
          "marks": 8,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u1-sub-1",
              "label": "1.1",
              "text": "Define cardiac arrhythmia, congenital heart disease, Coronary artery disease, cardiomyopathy, Rheumatic heart disease."
            },
            {
              "id": "pharmacotherapeutics-2-u1-sub-2",
              "label": "1.2",
              "text": "Describe electrophysiology of the heart."
            },
            {
              "id": "pharmacotherapeutics-2-u1-sub-3",
              "label": "1.3",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication and referral of Congestive cardiac failure, Angina Pectoris, Myocardial Infarction, Hyperlipidemias Anemia, Venous thromboembolism,"
            },
            {
              "id": "pharmacotherapeutics-2-u1-sub-4",
              "label": "1.4",
              "text": "Define Hypertension. Describe classification (JNC), pathophysiology, clinical features, pharmacological treatment guidelines and non-pharmacological management of hypertension."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u2",
          "unitNumber": 2,
          "title": "Dermatology",
          "hours": 25,
          "marks": 14,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u2-sub-1",
              "label": "2.1",
              "text": "Define Wound, Ulcer, blister, hives, actinic keratosis, rosacea, carbuncle, cellulitis, melanoma, vitiligo, contact dermatitis,warts, impetigo."
            },
            {
              "id": "pharmacotherapeutics-2-u2-sub-2",
              "label": "2.2",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication,and referral of Psoriasis, Scabies, Eczema, Acne, pediculosis."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u3",
          "unitNumber": 3,
          "title": "Endocrine system",
          "hours": 40,
          "marks": 23,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u3-sub-1",
              "label": "3.1",
              "text": "Define Acromegaly, Hashimoto’s disease, Cushing syndrome, Addison’s disease."
            },
            {
              "id": "pharmacotherapeutics-2-u3-sub-2",
              "label": "3.2",
              "text": "Describe hormone regulation system in normal physiology."
            },
            {
              "id": "pharmacotherapeutics-2-u3-sub-3",
              "label": "3.3",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication,and referral of Hypothyroidism. Hyperthyroidism, goiter, dysmenorrhoea."
            },
            {
              "id": "pharmacotherapeutics-2-u3-sub-4",
              "label": "3.4",
              "text": "Define Diabetes Mellitus. Describe classification, pathophysiology, clinical features, pharmacological treatment guidelines with doses regimen, non-pharmacological management and complications of Diabetes Mellitus."
            },
            {
              "id": "pharmacotherapeutics-2-u3-sub-5",
              "label": "3.5",
              "text": "Describe hormonal therapy for contraception."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u4",
          "unitNumber": 4,
          "title": "Oncology",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u4-sub-1",
              "label": "4.1",
              "text": "Define cancer, chemotherapy, benign, malignancy, biopsy, metastases, and tumor, leukemia, lymphoma,"
            },
            {
              "id": "pharmacotherapeutics-2-u4-sub-2",
              "label": "4.2",
              "text": "Describe basic principles of Cancer therapy."
            },
            {
              "id": "pharmacotherapeutics-2-u4-sub-3",
              "label": "4.3",
              "text": "Give general introduction to cancer chemotherapeutic agents."
            },
            {
              "id": "pharmacotherapeutics-2-u4-sub-4",
              "label": "4.4",
              "text": "Describe management of chemotherapy induced nausea and emesis."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u5",
          "unitNumber": 5,
          "title": "Ophthalmology",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u5-sub-1",
              "label": "",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication,and referral of Glaucoma, conjunctivitis, viral & bacterial (Eye Infections)"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u6",
          "unitNumber": 6,
          "title": "Renal system:",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u6-sub-1",
              "label": "",
              "text": "Introduction, Causes, clinical manifestations, investigation, prevention, pharmacological treatment with doses regimen, complication,and referral of Acute Renal Failure, Chronic Renal Failure, renal calculi, glomerulonephritis ( Rifle and GFR criteria)"
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u7",
          "unitNumber": 7,
          "title": "Poisoning",
          "hours": 10,
          "marks": 6,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u7-sub-1",
              "label": "7.1",
              "text": "Identify commonly found poisons from chemical, plant, and snake sources."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-2",
              "label": "7.2",
              "text": "Identify the effect of selected poisons locally and systemically."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-3",
              "label": "7.3",
              "text": "Describe the appropriate treatments for commonly found poisons and snakebite."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-4",
              "label": "7.4",
              "text": "Describe how to remove poisons by emesis and gastric lavage; tell exceptions for removal by emesis."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-5",
              "label": "7.5",
              "text": "Describe symptomatic treatment of poisoning effects."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-6",
              "label": "7.6",
              "text": "Identify indications for immediate referral."
            },
            {
              "id": "pharmacotherapeutics-2-u7-sub-7",
              "label": "7.7",
              "text": "Describe general management guidelines for poisoning."
            }
          ],
          "completed": false
        },
        {
          "id": "pharmacotherapeutics-2-u8",
          "unitNumber": 8,
          "title": "Nutritional disorders",
          "hours": 20,
          "marks": 11,
          "subUnits": [
            {
              "id": "pharmacotherapeutics-2-u8-sub-1",
              "label": "8.1",
              "text": "Discuss the evidence and extent of under-nutrition in Nepali children."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-2",
              "label": "8.2",
              "text": "Identify the common nutritional disorders of Nepali children."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-3",
              "label": "8.3",
              "text": "Discuss the chief causes and malnutrition and anemia among Nepali children."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-4",
              "label": "8.4",
              "text": "Identify the complications and long-term effects of chronic malnutrition and anemia."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-5",
              "label": "8.5",
              "text": "Describe how to assess a child for malnutrition and anaemia, based on criteria of the IMCI guidelines."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-6",
              "label": "8.6",
              "text": "Classify the nutritional status of a child (a case example or a child in the practice setting) as per IMCI guidelines."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-7",
              "label": "8.7",
              "text": "Describe the IMCI recommended management of each category of nutritional deficiency."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-8",
              "label": "8.8",
              "text": "Describe in brief the clinical features and treatment of deficiencies in: vitamin A, thiamin (vitamin B-1), vitamin B-2, vitamin B-6, vitamin B-12, vitamin D, vitamin C and iodine."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-9",
              "label": "8.9",
              "text": "Identify the effects of chronic deficiencies of these vitamins."
            },
            {
              "id": "pharmacotherapeutics-2-u8-sub-10",
              "label": "8.10",
              "text": "Discuss the principles and content of counseling for a child’s guardian, related to feeding and follow-up."
            }
          ],
          "completed": false
        }
      ],
      "references": [
        "Roger Walker and Cleve Edwards: Clinical Pharmacy and Therapeutics.",
        "Sathoskar, Pharmacology and pharmacotherapeutics, Vol. 1 & 2, Publ by Popular Prakashan, Mumbai.",
        "Koda-Kimble MA. Koda-Kimble and Young's Applied Therapeutics: The clinical use of drugs. Lippincott Williams & Wilkins",
        "DiPiro JT, Talbert RL, Yee GC, Matzke GR, Wells BG, Posey LM, editors. Pharmacotherapy: a pathophysiologic approach. 8th ed. Columbus",
        "Boon N. A. Davidson's principles and practice of medicine. Edinburgh: Churchill Livingstone Elsevier.",
        "Eric T. Clinical Pharmacy and Therapeutics. Williams and Wilkins Publication.",
        "Washington Manual and Medical therapeutics, 32nd Edition.",
        "Bertram. G. Katzung, Basic and clinical pharmacology",
        "J.G. Hardman and Lee E. Limbard, Good Mann &Gilmann: The Pharmacological basis of therapeutics, McGraw hill, Health Professions Dvn.",
        "Lippincott Williams and Wilkins: Remington Pharmaceutical Sciences, 20th Edition. Hamsten, Drug interaction, KvenStockley.",
        "Laurence, DR and Bennet PN. Clinical Pharmacology, Scientific book agency",
        "Grahame smith and Aronson, Clinical pharmacology and drug therapy",
        "Richard A Helms, Text Book of Therapeutics Drug and Disease Management Hardbound.",
        "Herfindal E T and Hirschman JL, Williams and Wilkins, Clinical Pharmacy and therapeutics",
        "Applied Therapeutics, The clinical uses of Drugs applied therapeutics INC",
        "Guidelines: The NICE guidelines, SIGN guidelines, WHO guidelines, guidelines provided by APhA, ASCO, American Diabetes Association Society Renal Society, American Heart Association."
      ]
    },
    {
      "id": "field-practice",
      "name": "Comprehensive Professional Field Practice",
      "theoryHours": 0,
      "practicalHours": 16,
      "totalHours": 16,
      "creditHours": 4,
      "theoryMarks": 0,
      "practicalMarks": 200,
      "totalMarks": 200,
      "description": "This course is designed to help students to apply the knowledge and skills in the actual professional practice.",
      "objectives": [
        "Read and interpret prescription, interpret dose, dispense and council the patients in community and hospital settings.",
        "Perform the manufacturing, quality assurance drugs and regulatory related functions as a pharmacy assistant."
      ],
      "units": [],
      "references": []
    }
  ]
};

export const class11ScienceData: YearData = {
  year: 11,
  subjects: [
    {
      id: 'neb-physics-11',
      name: 'Physics',
      theoryHours: 5,
      practicalHours: 2,
      totalHours: 150,
      creditHours: 5,
      theoryMarks: 75,
      practicalMarks: 25,
      totalMarks: 100,
      description:
        'NEB Class 11 Physics covering mechanics, thermodynamics, optics, electricity and modern physics.',
      objectives: [
        'Build conceptual understanding of physical laws and principles.',
        'Strengthen problem solving and quantitative reasoning in physics.',
        'Prepare learners for higher studies and technical applications.',
      ],
      units: [
        { id: 'neb-phy-u1', unitNumber: 1, title: 'Physical Quantities', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u1-sub-1', label: 'a', text: 'Precision, significant figures, dimensions and dimensional analysis.' }], completed: false },
        { id: 'neb-phy-u2', unitNumber: 2, title: 'Vectors', hours: 6, marks: 4, subUnits: [{ id: 'neb-phy-u2-sub-1', label: 'a', text: 'Vector laws, resolution, and scalar/vector products.' }], completed: false },
        { id: 'neb-phy-u3', unitNumber: 3, title: 'Kinematics', hours: 7, marks: 4, subUnits: [{ id: 'neb-phy-u3-sub-1', label: 'a', text: 'Motion equations, projectile motion, and relative velocity.' }], completed: false },
        { id: 'neb-phy-u4', unitNumber: 4, title: 'Dynamics', hours: 8, marks: 5, subUnits: [{ id: 'neb-phy-u4-sub-1', label: 'a', text: "Newton's laws, momentum, torque, and equilibrium." }], completed: false },
        { id: 'neb-phy-u5', unitNumber: 5, title: 'Work, Energy and Power', hours: 7, marks: 4, subUnits: [{ id: 'neb-phy-u5-sub-1', label: 'a', text: 'Work-energy theorem, conservation laws, and collisions.' }], completed: false },
        { id: 'neb-phy-u6', unitNumber: 6, title: 'Circular Motion', hours: 6, marks: 4, subUnits: [{ id: 'neb-phy-u6-sub-1', label: 'a', text: 'Angular motion, centripetal force, and vertical circular motion.' }], completed: false },
        { id: 'neb-phy-u7', unitNumber: 7, title: 'Gravitation', hours: 6, marks: 4, subUnits: [{ id: 'neb-phy-u7-sub-1', label: 'a', text: 'Gravitational field, orbital motion, and Kepler laws.' }], completed: false },
        { id: 'neb-phy-u8', unitNumber: 8, title: 'Elasticity', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u8-sub-1', label: 'a', text: "Stress, strain, Hooke's law, and elastic moduli." }], completed: false },
        { id: 'neb-phy-u9', unitNumber: 9, title: 'Heat and Temperature', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u9-sub-1', label: 'a', text: 'Heat-temperature distinction and thermal equilibrium.' }], completed: false },
        { id: 'neb-phy-u10', unitNumber: 10, title: 'Thermal Expansion', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u10-sub-1', label: 'a', text: 'Expansion of solids and liquids including anomalous water expansion.' }], completed: false },
        { id: 'neb-phy-u11', unitNumber: 11, title: 'Quantity of Heat', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u11-sub-1', label: 'a', text: 'Specific heat, latent heat, and calorimetry.' }], completed: false },
        { id: 'neb-phy-u12', unitNumber: 12, title: 'Rate of Heat Flow', hours: 3, marks: 2, subUnits: [{ id: 'neb-phy-u12-sub-1', label: 'a', text: 'Conduction, convection, radiation, and cooling law.' }], completed: false },
        { id: 'neb-phy-u13', unitNumber: 13, title: 'Ideal Gas', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u13-sub-1', label: 'a', text: 'Gas laws, ideal gas equation, kinetic theory, and work done.' }], completed: false },
        { id: 'neb-phy-u14', unitNumber: 14, title: 'Reflection at Curved Mirrors', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u14-sub-1', label: 'a', text: 'Mirror formula, image formation, and applications.' }], completed: false },
        { id: 'neb-phy-u15', unitNumber: 15, title: 'Refraction at Plane Surfaces', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u15-sub-1', label: 'a', text: "Snell's law, total internal reflection, and optical fiber basics." }], completed: false },
        { id: 'neb-phy-u16', unitNumber: 16, title: 'Refraction Through Prisms', hours: 3, marks: 2, subUnits: [{ id: 'neb-phy-u16-sub-1', label: 'a', text: 'Deviation, minimum deviation, and prism formula.' }], completed: false },
        { id: 'neb-phy-u17', unitNumber: 17, title: 'Lenses', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u17-sub-1', label: 'a', text: 'Lens formula, power, combinations, and eye defects.' }], completed: false },
        { id: 'neb-phy-u18', unitNumber: 18, title: 'Dispersion', hours: 3, marks: 2, subUnits: [{ id: 'neb-phy-u18-sub-1', label: 'a', text: 'Dispersive power, chromatic aberration, and achromatism.' }], completed: false },
        { id: 'neb-phy-u19', unitNumber: 19, title: 'Electric Charges', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u19-sub-1', label: 'a', text: "Coulomb's law and charge conservation." }], completed: false },
        { id: 'neb-phy-u20', unitNumber: 20, title: 'Electric Field', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u20-sub-1', label: 'a', text: 'Field intensity, electric flux, and Gauss law.' }], completed: false },
        { id: 'neb-phy-u21', unitNumber: 21, title: 'Potential, Potential Difference and Potential Energy', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u21-sub-1', label: 'a', text: 'Electric potential concepts and field-potential relation.' }], completed: false },
        { id: 'neb-phy-u22', unitNumber: 22, title: 'Capacitors', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u22-sub-1', label: 'a', text: 'Capacitance, combinations, stored energy, and dielectrics.' }], completed: false },
        { id: 'neb-phy-u23', unitNumber: 23, title: 'DC Circuits', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u23-sub-1', label: 'a', text: "Ohm's law, Kirchhoff rules, bridges, and potentiometer." }], completed: false },
        { id: 'neb-phy-u24', unitNumber: 24, title: 'Nuclear Physics', hours: 5, marks: 3, subUnits: [{ id: 'neb-phy-u24-sub-1', label: 'a', text: 'Radioactivity, decay law, half-life, fission, and fusion.' }], completed: false },
        { id: 'neb-phy-u25', unitNumber: 25, title: 'Solids', hours: 4, marks: 3, subUnits: [{ id: 'neb-phy-u25-sub-1', label: 'a', text: 'Band theory, semiconductors, and p-n junction basics.' }], completed: false },
        { id: 'neb-phy-u26', unitNumber: 26, title: 'Recent Trends in Physics', hours: 3, marks: 2, subUnits: [{ id: 'neb-phy-u26-sub-1', label: 'a', text: 'Nanotechnology, particle physics, plasma, and dark matter concepts.' }], completed: false },
      ],
      references: ['NEB/CDC Physics Curriculum Class 11 (2081 B.S.).'],
    },
    {
      id: 'neb-chemistry-11',
      name: 'Chemistry',
      theoryHours: 5,
      practicalHours: 2,
      totalHours: 150,
      creditHours: 5,
      theoryMarks: 75,
      practicalMarks: 25,
      totalMarks: 100,
      description:
        'NEB Class 11 Chemistry with general/physical, inorganic, and organic sections.',
      objectives: [
        'Develop foundation in structure of matter and chemical transformations.',
        'Apply stoichiometric and equilibrium principles to problem solving.',
        'Understand key inorganic and organic compounds with practical relevance.',
      ],
      units: [
        { id: 'neb-che-u1', unitNumber: 1, title: 'Foundation and Fundamentals', hours: 2, marks: 2, subUnits: [{ id: 'neb-che-u1-sub-1', label: 'a', text: 'Basic chemistry concepts, formulas, and composition.' }], completed: false },
        { id: 'neb-che-u2', unitNumber: 2, title: 'Stoichiometry', hours: 8, marks: 6, subUnits: [{ id: 'neb-che-u2-sub-1', label: 'a', text: 'Mole concept, limiting reagents, and yield calculations.' }], completed: false },
        { id: 'neb-che-u3', unitNumber: 3, title: 'Atomic Structure', hours: 8, marks: 6, subUnits: [{ id: 'neb-che-u3-sub-1', label: 'a', text: 'Atomic models, quantum concepts, and electronic configuration.' }], completed: false },
        { id: 'neb-che-u4', unitNumber: 4, title: 'Classification of Elements and Periodic Table', hours: 5, marks: 4, subUnits: [{ id: 'neb-che-u4-sub-1', label: 'a', text: 'Periodic law, blocks, groups, and periodic trends.' }], completed: false },
        { id: 'neb-che-u5', unitNumber: 5, title: 'Chemical Bonding and Shapes of Molecules', hours: 9, marks: 7, subUnits: [{ id: 'neb-che-u5-sub-1', label: 'a', text: 'Bonding types, VSEPR, hybridization, and intermolecular forces.' }], completed: false },
        { id: 'neb-che-u6', unitNumber: 6, title: 'Oxidation and Reduction', hours: 5, marks: 4, subUnits: [{ id: 'neb-che-u6-sub-1', label: 'a', text: 'Oxidation number, redox balancing, and electrolysis basics.' }], completed: false },
        { id: 'neb-che-u7', unitNumber: 7, title: 'States of Matter', hours: 8, marks: 6, subUnits: [{ id: 'neb-che-u7-sub-1', label: 'a', text: 'Gaseous, liquid, and solid state properties and behavior.' }], completed: false },
        { id: 'neb-che-u8', unitNumber: 8, title: 'Chemical Equilibrium', hours: 3, marks: 3, subUnits: [{ id: 'neb-che-u8-sub-1', label: 'a', text: 'Dynamic equilibrium, equilibrium constant, and Le Chatelier principle.' }], completed: false },
        { id: 'neb-che-u9', unitNumber: 9, title: 'Chemistry of Non-Metals', hours: 17, marks: 10, subUnits: [{ id: 'neb-che-u9-sub-1', label: 'a', text: 'Hydrogen, oxygen, nitrogen, halogens, carbon, phosphorus, and sulfur chemistry.' }], completed: false },
        { id: 'neb-che-u10', unitNumber: 10, title: 'Chemistry of Metals', hours: 13, marks: 9, subUnits: [{ id: 'neb-che-u10-sub-1', label: 'a', text: 'Metallurgy, alkali and alkaline earth metals, and key compounds.' }], completed: false },
        { id: 'neb-che-u11', unitNumber: 11, title: 'Bio-Inorganic Chemistry', hours: 5, marks: 4, subUnits: [{ id: 'neb-che-u11-sub-1', label: 'a', text: 'Biological importance of metal ions, ion pumps, and toxicity.' }], completed: false },
        { id: 'neb-che-u12', unitNumber: 12, title: 'Basic Concepts of Organic Chemistry', hours: 6, marks: 5, subUnits: [{ id: 'neb-che-u12-sub-1', label: 'a', text: 'Functional groups, nomenclature, isomerism, and qualitative analysis.' }], completed: false },
        { id: 'neb-che-u13', unitNumber: 13, title: 'Hydrocarbons', hours: 10, marks: 8, subUnits: [{ id: 'neb-che-u13-sub-1', label: 'a', text: 'Alkanes, alkenes, alkynes, and aromatic hydrocarbons.' }], completed: false },
        { id: 'neb-che-u14', unitNumber: 14, title: 'Haloalkanes and Haloarenes', hours: 6, marks: 5, subUnits: [{ id: 'neb-che-u14-sub-1', label: 'a', text: 'Preparation, substitution, elimination, and chlorobenzene chemistry.' }], completed: false },
        { id: 'neb-che-u15', unitNumber: 15, title: 'Alcohols, Phenols and Ethers', hours: 6, marks: 5, subUnits: [{ id: 'neb-che-u15-sub-1', label: 'a', text: 'Nomenclature, preparation, and key reactions of alcohols, phenols, ethers.' }], completed: false },
        { id: 'neb-che-u16', unitNumber: 16, title: 'Aldehydes, Ketones and Carboxylic Acids', hours: 4, marks: 4, subUnits: [{ id: 'neb-che-u16-sub-1', label: 'a', text: 'Preparation, nucleophilic addition, qualitative tests, and esterification.' }], completed: false },
      ],
      references: ['NEB/CDC Chemistry Curriculum Class 11 (2081 B.S.).'],
    },
    {
      id: 'neb-biology-11',
      name: 'Biology',
      theoryHours: 5,
      practicalHours: 2,
      totalHours: 150,
      creditHours: 5,
      theoryMarks: 75,
      practicalMarks: 25,
      totalMarks: 100,
      description:
        'NEB Class 11 Biology with balanced Botany and Zoology components.',
      objectives: [
        'Understand life processes and biological diversity from cell to ecosystem.',
        'Develop fundamental knowledge in both plant and animal biology.',
        'Connect biology concepts with conservation and environmental issues.',
      ],
      units: [
        { id: 'neb-bio-u1', unitNumber: 1, title: 'Biomolecules and Cell Biology', hours: 6, marks: 5, subUnits: [{ id: 'neb-bio-u1-sub-1', label: 'a', text: 'Cell structure, biomolecules, and cell division.' }], completed: false },
        { id: 'neb-bio-u2', unitNumber: 2, title: 'Floral Diversity', hours: 13, marks: 9, subUnits: [{ id: 'neb-bio-u2-sub-1', label: 'a', text: 'Classification systems and major plant/fungal groups.' }], completed: false },
        { id: 'neb-bio-u3', unitNumber: 3, title: 'Morphology of Flowering Plants', hours: 16, marks: 10, subUnits: [{ id: 'neb-bio-u3-sub-1', label: 'a', text: 'Root, stem, leaf, flower, fruit, seed, and family morphology.' }], completed: false },
        { id: 'neb-bio-u4', unitNumber: 4, title: 'Anatomy of Flowering Plants', hours: 22, marks: 12, subUnits: [{ id: 'neb-bio-u4-sub-1', label: 'a', text: 'Plant tissue systems and dicot/monocot anatomy with secondary growth.' }], completed: false },
        { id: 'neb-bio-u5', unitNumber: 5, title: 'Vegetation and Ecology', hours: 3, marks: 3, subUnits: [{ id: 'neb-bio-u5-sub-1', label: 'a', text: 'Vegetation types and conservation in Nepal.' }], completed: false },
        { id: 'neb-bio-u6', unitNumber: 6, title: 'Introduction to Biology', hours: 1, marks: 1, subUnits: [{ id: 'neb-bio-u6-sub-1', label: 'a', text: 'Scope and interdisciplinary nature of biology.' }], completed: false },
        { id: 'neb-bio-u7', unitNumber: 7, title: 'Evolution', hours: 15, marks: 10, subUnits: [{ id: 'neb-bio-u7-sub-1', label: 'a', text: 'Origin of life, evolutionary theories, and human evolution.' }], completed: false },
        { id: 'neb-bio-u8', unitNumber: 8, title: 'Faunal Diversity', hours: 18, marks: 11, subUnits: [{ id: 'neb-bio-u8-sub-1', label: 'a', text: 'Major animal phyla and representative organisms.' }], completed: false },
        { id: 'neb-bio-u9', unitNumber: 9, title: 'Biota and Environment', hours: 14, marks: 10, subUnits: [{ id: 'neb-bio-u9-sub-1', label: 'a', text: 'Ecosystem structure, energy flow, cycles, and biodiversity.' }], completed: false },
        { id: 'neb-bio-u10', unitNumber: 10, title: 'Conservation Biology', hours: 4, marks: 4, subUnits: [{ id: 'neb-bio-u10-sub-1', label: 'a', text: 'Wildlife conservation, IUCN categories, and Nepal context.' }], completed: false },
      ],
      references: ['NEB/CDC Biology Curriculum Class 11 (2081 B.S.).'],
    },
    {
      id: 'neb-mathematics-11',
      name: 'Mathematics',
      theoryHours: 6,
      practicalHours: 0,
      totalHours: 160,
      creditHours: 5,
      theoryMarks: 100,
      practicalMarks: 0,
      totalMarks: 100,
      description:
        'NEB Class 11 Mathematics including algebra, trigonometry, geometry, vectors, statistics, probability, calculus and mechanics.',
      objectives: [
        'Develop strong mathematical reasoning and analytical skills.',
        'Apply algebraic, geometric, and calculus tools to solve problems.',
        'Build foundation for engineering, sciences, and competitive exams.',
      ],
      units: [
        { id: 'neb-mat-u1', unitNumber: 1, title: 'Logic and Set Theory', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u1-sub-1', label: 'a', text: 'Statements, connectives, sets, and cardinality.' }], completed: false },
        { id: 'neb-mat-u2', unitNumber: 2, title: 'Real Numbers', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u2-sub-1', label: 'a', text: 'Axioms, absolute value, and geometric representation.' }], completed: false },
        { id: 'neb-mat-u3', unitNumber: 3, title: 'Functions', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u3-sub-1', label: 'a', text: 'Domain, range, composition, inverse, and graph sketching.' }], completed: false },
        { id: 'neb-mat-u4', unitNumber: 4, title: 'Sequence and Series', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u4-sub-1', label: 'a', text: 'AP, GP, HP, and mean relationships.' }], completed: false },
        { id: 'neb-mat-u5', unitNumber: 5, title: 'Matrices and Determinants', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u5-sub-1', label: 'a', text: 'Matrix operations, determinant properties, and linear equations.' }], completed: false },
        { id: 'neb-mat-u6', unitNumber: 6, title: 'Complex Numbers', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u6-sub-1', label: 'a', text: 'Argand plane, polar form, and De Moivre theorem.' }], completed: false },
        { id: 'neb-mat-u7', unitNumber: 7, title: 'Quadratic Equations', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u7-sub-1', label: 'a', text: 'Roots, discriminant, and equation formation.' }], completed: false },
        { id: 'neb-mat-u8', unitNumber: 8, title: 'Permutation and Combination', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u8-sub-1', label: 'a', text: 'Counting principles, permutations, combinations, and binomial theorem.' }], completed: false },
        { id: 'neb-mat-u9', unitNumber: 9, title: 'Inverse Circular Functions', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u9-sub-1', label: 'a', text: 'Definitions, principal values, and properties.' }], completed: false },
        { id: 'neb-mat-u10', unitNumber: 10, title: 'Trigonometric Equations', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u10-sub-1', label: 'a', text: 'General solutions and interval-based solutions.' }], completed: false },
        { id: 'neb-mat-u11', unitNumber: 11, title: 'Straight Lines', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u11-sub-1', label: 'a', text: 'Line equations, angle relations, and distance concepts.' }], completed: false },
        { id: 'neb-mat-u12', unitNumber: 12, title: 'Pair of Lines', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u12-sub-1', label: 'a', text: 'Second-degree equations representing pair of lines.' }], completed: false },
        { id: 'neb-mat-u13', unitNumber: 13, title: 'Circles', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u13-sub-1', label: 'a', text: 'Circle equations, tangent, and normal.' }], completed: false },
        { id: 'neb-mat-u14', unitNumber: 14, title: 'Conic Sections', hours: 7, marks: 4, subUnits: [{ id: 'neb-mat-u14-sub-1', label: 'a', text: 'Parabola, ellipse, and hyperbola fundamentals.' }], completed: false },
        { id: 'neb-mat-u15', unitNumber: 15, title: 'Coordinates in Space', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u15-sub-1', label: 'a', text: '3D coordinates, distance, and section formula.' }], completed: false },
        { id: 'neb-mat-u16', unitNumber: 16, title: 'Vectors', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u16-sub-1', label: 'a', text: 'Vector algebra, linear dependence, and applications.' }], completed: false },
        { id: 'neb-mat-u17', unitNumber: 17, title: 'Statistics', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u17-sub-1', label: 'a', text: 'Dispersion, skewness, kurtosis, correlation, and regression.' }], completed: false },
        { id: 'neb-mat-u18', unitNumber: 18, title: 'Probability', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u18-sub-1', label: 'a', text: 'Probability laws, conditional probability, and Bayes theorem.' }], completed: false },
        { id: 'neb-mat-u19', unitNumber: 19, title: 'Limits and Continuity', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u19-sub-1', label: 'a', text: 'Limit concepts and continuity analysis.' }], completed: false },
        { id: 'neb-mat-u20', unitNumber: 20, title: 'Derivatives', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u20-sub-1', label: 'a', text: 'Differentiation rules and derivatives of standard functions.' }], completed: false },
        { id: 'neb-mat-u21', unitNumber: 21, title: 'Applications of Derivatives', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u21-sub-1', label: 'a', text: 'Tangents, monotonicity, extrema, and mean value theorems.' }], completed: false },
        { id: 'neb-mat-u22', unitNumber: 22, title: 'Anti-Derivatives (Integration)', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u22-sub-1', label: 'a', text: 'Methods of integration and area applications.' }], completed: false },
        { id: 'neb-mat-u23', unitNumber: 23, title: 'Computational Methods', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u23-sub-1', label: 'a', text: 'Numerical integration and interpolation techniques.' }], completed: false },
        { id: 'neb-mat-u24', unitNumber: 24, title: 'Mechanics', hours: 6, marks: 4, subUnits: [{ id: 'neb-mat-u24-sub-1', label: 'a', text: 'Statics, dynamics, SHM, and projectile basics.' }], completed: false },
      ],
      references: ['NEB/CDC Mathematics Curriculum Class 11 (2081 B.S.).'],
    },
    {
      id: 'neb-english-11',
      name: 'English',
      theoryHours: 5,
      practicalHours: 0,
      totalHours: 150,
      creditHours: 4,
      theoryMarks: 75,
      practicalMarks: 25,
      totalMarks: 100,
      description:
        'Compulsory Class 11 English focusing on language development and literature.',
      objectives: [
        'Improve listening, speaking, reading, and writing proficiency.',
        'Apply grammar and vocabulary accurately in context.',
        'Develop literary appreciation and critical response skills.',
      ],
      units: [
        { id: 'neb-eng-u1', unitNumber: 1, title: 'Reading Skills', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u1-sub-1', label: 'a', text: 'Skimming, scanning, and comprehension of thematic texts.' }], completed: false },
        { id: 'neb-eng-u2', unitNumber: 2, title: 'Grammar in Context', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u2-sub-1', label: 'a', text: 'Tense, voice, narration, modals, and sentence accuracy.' }], completed: false },
        { id: 'neb-eng-u3', unitNumber: 3, title: 'Writing Skills', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u3-sub-1', label: 'a', text: 'Paragraphs, essays, letters, reports, and summaries.' }], completed: false },
        { id: 'neb-eng-u4', unitNumber: 4, title: 'Vocabulary Development', hours: 16, marks: 10, subUnits: [{ id: 'neb-eng-u4-sub-1', label: 'a', text: 'Word formation, idioms, and lexical relationships.' }], completed: false },
        { id: 'neb-eng-u5', unitNumber: 5, title: 'Speaking and Listening', hours: 16, marks: 10, subUnits: [{ id: 'neb-eng-u5-sub-1', label: 'a', text: 'Oral presentation, discussion, and listening comprehension.' }], completed: false },
        { id: 'neb-eng-u6', unitNumber: 6, title: 'Prose (Short Stories and Essays)', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u6-sub-1', label: 'a', text: 'Theme, characterization, and prose analysis.' }], completed: false },
        { id: 'neb-eng-u7', unitNumber: 7, title: 'Poetry', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u7-sub-1', label: 'a', text: 'Poetic devices, themes, and appreciation.' }], completed: false },
        { id: 'neb-eng-u8', unitNumber: 8, title: 'Drama / One Act Plays', hours: 17, marks: 11, subUnits: [{ id: 'neb-eng-u8-sub-1', label: 'a', text: 'Dramatic elements, themes, and interpretation.' }], completed: false },
        { id: 'neb-eng-u9', unitNumber: 9, title: 'Novel / Extended Reading', hours: 16, marks: 10, subUnits: [{ id: 'neb-eng-u9-sub-1', label: 'a', text: 'Narrative structure, character arc, and contextual reading.' }], completed: false },
      ],
      references: ['NEB/CDC English Curriculum Class 11 (2081 B.S.).'],
    },
    {
      id: 'neb-nepali-11',
      name: 'Nepali',
      theoryHours: 5,
      practicalHours: 0,
      totalHours: 150,
      creditHours: 4,
      theoryMarks: 75,
      practicalMarks: 25,
      totalMarks: 100,
      description:
        'Compulsory Class 11 Nepali focused on literature, grammar, and composition.',
      objectives: [
        'Strengthen Nepali language proficiency in reading and writing.',
        'Develop literary understanding of prose, poetry, and drama.',
        'Build grammar and composition competency for academic expression.',
      ],
      units: [
        { id: 'neb-nep-u1', unitNumber: 1, title: 'Prose (Gadya)', hours: 13, marks: 8, subUnits: [{ id: 'neb-nep-u1-sub-1', label: 'a', text: 'Stories and essays with cultural and social themes.' }], completed: false },
        { id: 'neb-nep-u2', unitNumber: 2, title: 'Poetry (Padya)', hours: 13, marks: 8, subUnits: [{ id: 'neb-nep-u2-sub-1', label: 'a', text: 'Poems, poetic forms, devices, and appreciation.' }], completed: false },
        { id: 'neb-nep-u3', unitNumber: 3, title: 'Essays and Non-Fiction (Prabandha)', hours: 13, marks: 8, subUnits: [{ id: 'neb-nep-u3-sub-1', label: 'a', text: 'Expository and argumentative essay analysis.' }], completed: false },
        { id: 'neb-nep-u4', unitNumber: 4, title: 'Drama (Nataka)', hours: 13, marks: 8, subUnits: [{ id: 'neb-nep-u4-sub-1', label: 'a', text: 'One-act plays, dialogue, conflict, and theme.' }], completed: false },
        { id: 'neb-nep-u5', unitNumber: 5, title: 'Morphology (Sabda Bichar)', hours: 12, marks: 8, subUnits: [{ id: 'neb-nep-u5-sub-1', label: 'a', text: 'Word classes and grammatical forms in Nepali.' }], completed: false },
        { id: 'neb-nep-u6', unitNumber: 6, title: 'Syntax (Vakya Bichar)', hours: 12, marks: 8, subUnits: [{ id: 'neb-nep-u6-sub-1', label: 'a', text: 'Sentence structures, transformation, and agreement.' }], completed: false },
        { id: 'neb-nep-u7', unitNumber: 7, title: 'Vocabulary and Word Formation', hours: 12, marks: 8, subUnits: [{ id: 'neb-nep-u7-sub-1', label: 'a', text: 'Vocabulary types, idioms, and word formation methods.' }], completed: false },
        { id: 'neb-nep-u8', unitNumber: 8, title: 'Literary Devices', hours: 12, marks: 8, subUnits: [{ id: 'neb-nep-u8-sub-1', label: 'a', text: 'Alankara, rasa, and basic chandas concepts.' }], completed: false },
        { id: 'neb-nep-u9', unitNumber: 9, title: 'Essay Writing', hours: 12, marks: 9, subUnits: [{ id: 'neb-nep-u9-sub-1', label: 'a', text: 'Descriptive and analytical essay writing practice.' }], completed: false },
        { id: 'neb-nep-u10', unitNumber: 10, title: 'Letter Writing', hours: 12, marks: 9, subUnits: [{ id: 'neb-nep-u10-sub-1', label: 'a', text: 'Formal and informal letters and reports.' }], completed: false },
        { id: 'neb-nep-u11', unitNumber: 11, title: 'Summary and Precis Writing', hours: 13, marks: 9, subUnits: [{ id: 'neb-nep-u11-sub-1', label: 'a', text: 'Summarization, précis writing, and title selection.' }], completed: false },
        { id: 'neb-nep-u12', unitNumber: 12, title: 'Report Writing and Other Forms', hours: 13, marks: 9, subUnits: [{ id: 'neb-nep-u12-sub-1', label: 'a', text: 'Report, paragraph, and basic translation forms.' }], completed: false },
      ],
      references: ['NEB/CDC Nepali Curriculum Class 11 (2081 B.S.).'],
    },
  ],
};

export const getTotalUnits = (yearData: YearData): number => {
  return yearData.subjects.reduce((total, subject) => total + subject.units.length, 0);
};

export const getTotalHours = (yearData: YearData): number => {
  return yearData.subjects.reduce((total, subject) => total + subject.totalHours, 0);
};

export const getTotalMarks = (yearData: YearData): number => {
  return yearData.subjects.reduce((total, subject) => total + subject.totalMarks, 0);
};
