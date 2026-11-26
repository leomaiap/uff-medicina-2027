        // 1. DATA OFICIAL DOS 14 CURSOS DE ESPECIALIZAÇÃO (MINUTA EDITAL UNIFICADO CMM Nº 01/2026 - TURMAS 2027)
        // -------------------------------------------------------------
        const specialties = [
            {
                id: 'analises-clinicas',
                title: 'Análises Clínicas',
                duration: '12 Meses',
                hours: '360 horas',
                vagas: '22 vagas AC + 03 Estrangeiros',
                vagasShort: '25 vagas (22 AC + 3 Ext)',
                inicio: '05/03/2027',
                prereq: 'Graduação em Medicina, Farmácia, Farmácia-Bioquímica, Biologia e Biomedicina.',
                stage1: 'Prova Objetiva • 25 questões • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '05 alunos matriculados (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Quinzenal • Sexta virtual (18h30 às 21h30) e Sábado presencial (09h às 17h)',
                image: 'assets/img/especialidades/analises-clinicas.webp',
                rgb: '26, 94, 58',
                rgbDark: '14, 56, 34',
                syllabus: {
                    "topics": [
                        {
                            "group": "I. Bioquímica",
                            "items": [
                                "Controle de qualidade em exames laboratoriais",
                                "Métodos diagnósticos de avaliação de proteínas plasmáticas e urinárias",
                                "Enzimas de interesse clínico",
                                "Diagnóstico laboratorial de dislipidemias",
                                "Diagnóstico de doenças cardiovasculares",
                                "Diagnóstico laboratorial de doenças hepatobiliares",
                                "Diagnóstico laboratorial das doenças endócrinas",
                                "Diagnóstico laboratorial de doenças renais"
                            ]
                        },
                        {
                            "group": "II. Hematologia",
                            "items": [
                                "Principais exames laboratoriais em Hematologia Clínica, tipos celulares investigados e interpretações dos exames hematológicos"
                            ]
                        },
                        {
                            "group": "III. Imunologia",
                            "items": [
                                "Introdução ao sistema imune (conceitos fundamentais)",
                                "Principais técnicas utilizadas em imunodiagnóstico",
                                "Controle de qualidade em imunologia, coleta, armazenamento de amostras e liberação de laudos",
                                "Diagnóstico sorológico de doenças infecciosas",
                                "Laboratório de imunologia na triagem neonatal",
                                "Imunodiagnóstico de doenças neoplásicas",
                                "Imunodeficiências",
                                "Diagnóstico laboratorial de doenças autoimunes"
                            ]
                        },
                        {
                            "group": "IV. Microbiologia",
                            "items": [
                                "Métodos microbiológicos: colorações (Gram e Ziehl-Neelsen) e meios de cultura (Ágar sangue, Chocolate, Thayer-Martin, Manitol Salgado, MacConkey, EMB, Mueller Hinton)",
                                "Características morfo-tintoriais dos principais patógenos humanos (S. aureus, S. pyogenes, S. agalactiae, S. pneumoniae, Enterococcus spp., Enterobacterales, P. aeruginosa, Acinetobacter spp., Neisseria spp., T. pallidum, M. tuberculosis)",
                                "Testes de sensibilidade aos antimicrobianos (microdiluição em caldo, disco-difusão e fita-gradiente: vantagens e limitações)"
                            ]
                        },
                        {
                            "group": "V. Parasitologia",
                            "items": [
                                "Protozoários e helmintos de importância médica, métodos e técnicas de identificação e diagnóstico parasitológico"
                            ]
                        }
                    ],
                    "references": [
                        "Bioquímica: BURTIS, C.A.; ASHWOOD, R.E. Tietz: Textbook of Clinical Chemistry and Molecular Biology. 5th ed. W.B. Saunders, 2013.",
                        "Bioquímica: BURTIS, C.A.; ASHWOOD, R.E. Tietz: Fundamentos de Química Clínica. 6ª ed. Rio de Janeiro: Elsevier, 2008.",
                        "Bioquímica: GAW, A.; COWAN, R.A. et al. Bioquímica Clínica – Um Texto Ilustrado. 5ª ed. Rio de Janeiro: Guanabara Koogan, 2015.",
                        "Bioquímica: HENRY, J.B. Clinical Diagnosis and Management by Laboratory Methods. 22nd ed. W.B. Saunders, 2011.",
                        "Hematologia: RIBEIRO, Georgina Severo. Manual de hematologia. 1ª ed. Vitória: EDUFF, 2021; Caderno de Apoio à Coleta Laboratorial (Prefeitura de SP, 2023, págs. 85–91).",
                        "Imunologia: FERREIRA et al. Diagnóstico das principais doenças infecciosas e autoimunes (2013); SANTOS et al. Virologia Humana, 3ª ed. (2015); ABBAS et al. Imunologia Celular e Molecular (2019); VAZ et al. Imunoensaios: Fundamentos e aplicações (2018). Ed. Guanabara Koogan.",
                        "Microbiologia: PROCOP, G.W. et al. Koneman – Diagnóstico Microbiológico. 7ª ed. Guanabara Koogan, 2018.",
                        "Microbiologia: OPLUSTIL, C.P. et al. Procedimentos Básicos em Microbiologia Clínica. 4ª ed. Sarvier, 2020.",
                        "Parasitologia: NEVES, D.P. et al. Parasitologia Humana. 12ª ed. Atheneu."
                    ]
                }
            },
            {
                id: 'anestesiologia',
                title: 'Anestesiologia',
                duration: '36 Meses',
                hours: '8.640 horas',
                vagas: '02 vagas + Cadastro Reserva (CR*)',
                vagasShort: '02 vagas + CR*',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva • 25 questões de múltipla escolha • Nota mín. 7,0',
                stage2: 'Etapa única (sem análise curricular e sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Semanal seg a sex (07h às 19h) presencial/virtual • Terças 19h on-line SBA',
                image: 'assets/img/especialidades/anestesiologia.webp',
                rgb: '26, 92, 102',
                rgbDark: '14, 56, 64',
                syllabus: {
                    "topics": [
                        "Ética Médica e Bioética",
                        "Avaliação pré-operatória / pré-anestésica",
                        "Sistema Nervoso Autônomo e Sistema Nervoso Central",
                        "Farmacologia geral",
                        "Fisiologia e farmacologia cardiovascular",
                        "Fisiologia e farmacologia respiratória",
                        "Fisiologia e farmacologia renal",
                        "Vias aéreas e preditores de via aérea difícil",
                        "Sistema endócrino e sistema gastrointestinal",
                        "Parada cardíaca e reanimação cardiopulmonar",
                        "O paciente de terapia intensiva, oxigenioterapia e ventilação mecânica",
                        "Emergências médicas"
                    ],
                    "references": [
                        "CARMONA, M.J.C. et al. Tratado de Anestesiologia SAESP. 10ª ed. São Paulo: Editora dos Editores – SAESP, 2025.",
                        "HAJJAR, L.A. et al. Medicina de emergência: abordagem prática. 18ª ed. rev. e atual. Santana de Parnaíba (SP): Manole, 2024."
                    ]
                }
            },
            {
                id: 'cardiologia',
                title: 'Cardiologia',
                duration: '2 Anos',
                hours: '3.285 horas',
                vagas: '15 vagas AC + 03 Estrangeiros',
                vagasShort: '18 vagas (15 AC + 3 Ext)',
                inicio: '09/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva • 20 questões de múltipla escolha • Nota mín. 7,0',
                stage2: 'Etapa única (sem análise curricular e sem entrevista)',
                minAlunos: '10 alunos matriculados (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Teóricas presenciais seg e ter (08h às 13h) • Prática no HUAP no 2º ano',
                image: 'assets/img/especialidades/cardiologia.webp',
                seal: {
                    src: 'assets/img/selo-sbc.png',
                    alt: 'Selo SBC - Sociedade Brasileira de Cardiologia',
                    label: 'Credenciamento SBC',
                    url: 'https://www.portal.cardiol.br/credenciamento?tab=Credenciamento+Provis%C3%B3rio'
                },
                rgb: '112, 24, 42',
                rgbDark: '68, 12, 24',
                syllabus: {
                    "topics": [
                        {
                            "group": "I. Fundamentos da Cardiologia",
                            "items": [
                                "Anatomia do coração: estruturas cardíacas e vascularização",
                                "Fisiologia cardíaca: ciclo cardíaco, condução elétrica e regulação da frequência cardíaca",
                                "Fisiopatologia cardiovascular: mecanismos de doenças e resposta a estresses"
                            ]
                        },
                        {
                            "group": "II. Doenças Cardiovasculares",
                            "items": [
                                "Doença Arterial Coronariana (DAC): fatores de risco, diagnóstico, tratamento e síndromes coronarianas agudas",
                                "Insuficiência Cardíaca: classificação e estágios, diagnóstico diferencial, terapias farmacológicas e não farmacológicas",
                                "Arritmias Cardíacas: tipos, diagnóstico (ECG, Holter) e tratamento (medicamentoso e dispositivos)",
                                "Doenças Valvares: estenose e insuficiência valvar; abordagem cirúrgica e não cirúrgica",
                                "Hipertensão Arterial: classificação, epidemiologia e manejo farmacológico e não farmacológico"
                            ]
                        },
                        {
                            "group": "III. Exames Diagnósticos",
                            "items": [
                                "Eletrocardiograma (ECG): interpretação e principais arritmias",
                                "Ecocardiograma: indicações, técnica e interpretação",
                                "Testes de estresse: indicações, contraindicações e interpretação",
                                "Outros exames (Holter, monitoramento pressórico, angiografia): indicações e interpretação"
                            ]
                        },
                        {
                            "group": "IV. Tratamento e Manejo de Pacientes",
                            "items": [
                                "Farmacoterapia: classes cardiovasculares, efeitos colaterais e interações",
                                "Terapias invasivas: cateterismo cardíaco e cirurgia cardíaca",
                                "Prevenção de doenças cardiovasculares: saúde pública e estilo de vida",
                                "Cuidados paliativos em Cardiologia: abordagem multidisciplinar e gestão de sintomas"
                            ]
                        },
                        {
                            "group": "V. Aspectos Éticos e Legais",
                            "items": [
                                "Consentimento informado",
                                "Diretrizes para a prática médica",
                                "Questões éticas no tratamento de doenças cardiovasculares"
                            ]
                        }
                    ],
                    "references": [
                        "SOCIEDADE BRASILEIRA DE CARDIOLOGIA. Livro Texto da Sociedade Brasileira de Cardiologia. 3ª ed. São Paulo: SBC, 2021.",
                        "MANN, D.L.; ZIPES, D.P.; LIBBY, P.; BONOW, R.O. Braunwald: Tratado de Doenças Cardiovasculares. 11ª ed. São Paulo: Manole, 2022."
                    ]
                }
            },
            {
                id: 'dermatologia',
                title: 'Dermatologia',
                duration: '3 Anos',
                hours: '8.190 horas',
                vagas: '02 vagas',
                vagasShort: '02 vagas',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva • 50 questões de múltipla escolha • Nota mín. 7,0 (Peso 4)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h) • Eventuais aulas virtuais noturnas',
                image: 'assets/img/especialidades/dermatologia.webp',
                rgb: '128, 78, 46',
                rgbDark: '82, 46, 25',
                syllabus: {
                    "topics": [
                        "Anatomia e fisiologia da pele",
                        "Alterações fisiológicas da pele da criança, adolescente, adulto e idoso",
                        "Acne",
                        "Buloses",
                        "Colagenoses",
                        "Dermatoses metabólicas",
                        "Dermatoses por imunodeficiências",
                        "Dermatoses ocupacionais",
                        "Dermatoviroses",
                        "Dermatozoonoses",
                        "Doenças granulomatosas",
                        "DST / IST",
                        "Eczemas e doenças eritemato-escamosas, eritrodermias",
                        "Erupções por drogas",
                        "Farmacodermias",
                        "Fotodermatoses",
                        "Genodermatoses",
                        "Hanseníase",
                        "Leishmaniose",
                        "Lesões elementares",
                        "Micoses subcutâneas e sistêmicas",
                        "Micoses superficiais",
                        "Piodermites",
                        "Terapêutica dermatológica, interações medicamentosas e efeitos colaterais",
                        "Psoríase",
                        "Semiologia e métodos complementares",
                        "Tuberculose cutânea e micobacterioses",
                        "Tumores cutâneos",
                        "Urgências dermatológicas",
                        "Urticárias",
                        "Doenças do couro cabeludo",
                        "Líquen plano e erupções liquenoides",
                        "Sarcoidose e outras doenças granulomatosas não infecciosas"
                    ],
                    "references": [
                        "BELDA JUNIOR, W.; TALHARI, S.; TALHARI, C.C.; GONÇALVES, H.S. Dermatologia Tropical. São Paulo: Atheneu, 2022.",
                        "GRIFFITHS, C. (Ed.) et al. Rook’s Textbook of Dermatology. 10th ed. Wiley, 2024. 4 v."
                    ]
                }
            },
            {
                id: 'gastroenterologia',
                title: 'Gastroenterologia',
                duration: '2 Anos',
                hours: '5.760 horas',
                vagas: '01 vaga',
                vagasShort: '01 vaga',
                inicio: '08/03/2027',
                prereq: 'Residência Médica ou especialização em Clínica Médica, por no mínimo 2 anos.',
                stage1: 'Prova Discursiva • 05 questões discursivas • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/gastroenterologia.webp',
                rgb: '106, 52, 26',
                rgbDark: '66, 30, 14',
                syllabus: {
                    "topics": [
                        "Doença do refluxo gastroesofágico",
                        "Úlcera péptica",
                        "Tumores malignos do tubo digestório",
                        "Pancreatite aguda e crônica",
                        "Diarreia aguda e crônica",
                        "Cirrose hepática",
                        "Hemorragia digestiva",
                        "Doença litiásica biliar",
                        "Hepatites agudas e crônicas"
                    ],
                    "references": [
                        "Harrison’s Principles of Internal Medicine. 22ª ed. (2025).",
                        "Current Diagnosis & Treatment: Gastroenterology, Hepatology & Endoscopy. 4ª ed. (2022)."
                    ]
                }
            },
            {
                id: 'gerontologia',
                title: 'Gerontologia e Geriatria Interdisciplinar',
                duration: '2 Anos (Médicos) / 1 Ano e 6 Meses (Não Médicos)',
                hours: '5.760h (Médicos) / 1.040h (Não Médicos)',
                vagas: '10 Médicos + 20 Não Médicos (Nutrição 3, Fono 3, Fisioterapia 2, Ed. Física 2, Enfermagem 2, Farmácia 2, TO 2, Serv. Social 2, Demais 2)',
                vagasShort: '30 vagas (10 Médicos + 20 Não Médicos)',
                inicio: '10/03/2027',
                prereq: 'Médicos: Residência em Clínica Médica (CNRM), ou declaração de 4 anos de atividades em Clínica Médica supervisionadas por profissional com RQE em Clínica Médica, ou estágio em Clínica Médica correspondente à mesma carga horária da residência médica com comprovante assinado por profissional com RQE. Não Médicos: Graduação reconhecida pelo MEC em todas as áreas (exceto licenciatura curta), com redistribuição de vagas ociosas entre categorias (Item 1.3 § único).',
                stage1: 'Prova Objetiva • 20 questões de múltipla escolha (16 de Clínica Médica para médicos) • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '12 alunos matriculados (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Quartas híbridas (08h às 19h • Mequinho/FacMed/HUAP) • Médicos: 60h/sem (com plantão e ILPI)',
                image: 'assets/img/especialidades/gerontologia.webp',
                rgb: '122, 74, 38',
                rgbDark: '76, 44, 20',
                syllabus: {
                    "topics": [
                        {
                            "group": "Conteúdo Geral (todos os candidatos, inclusive médicos)",
                            "items": [
                                "Conceitos básicos sobre o envelhecimento",
                                "Análise crítica das principais políticas públicas para o idoso"
                            ]
                        },
                        {
                            "group": "Conteúdo Específico (exclusivo para médicos)",
                            "items": [
                                "Clínica Médica e Geriatria baseadas nas referências específicas abaixo (16 das 20 questões)"
                            ]
                        }
                    ],
                    "references": [
                        "Geral: BRASIL. Ministério da Saúde. Cadernos de Atenção Básica nº 19: envelhecimento e saúde da pessoa idosa (2006); Portaria nº 399/2006 (Pacto pela Saúde); Portaria nº 2.528/2006 (Política Nacional de Saúde da Pessoa Idosa).",
                        "Geral: BRASIL. Decreto nº 9.921/2019; Estatuto da Pessoa Idosa (Lei nº 10.741/2003, alterada pela Lei nº 14.423/2022); Lei Orgânica da Saúde (Lei nº 8.080/1990).",
                        "Médicos: Current Medical Diagnosis & Treatment. 65th ed. McGraw Hill, 2026.",
                        "Médicos: FREITAS, Elizabete Viana de et al. Tratado de Geriatria e Gerontologia. 6ª ed. Rio de Janeiro: Guanabara Koogan, 2026."
                    ]
                }
            },
            {
                id: 'hematologia',
                title: 'Hematologia Clínica',
                duration: '2 Anos',
                hours: '3.690 horas',
                vagas: '02 vagas + Cadastro Reserva (CR*)',
                vagasShort: '02 vagas + CR*',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina com experiência de pelo menos 1 ano em Medicina Clínica, urgência/emergência ou terapia intensiva (comprovado por contrato de trabalho ou equivalente).',
                stage1: 'Prova Objetiva e Discursiva • 20 questões (18 múltipla escolha + 02 discursivas) • Nota mín. 6,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/hematologia.webp',
                rgb: '108, 22, 48',
                rgbDark: '66, 12, 28',
                syllabus: {
                    "topics": [
                        "Anemias",
                        "Leucemias",
                        "Linfomas",
                        "Síndromes mielodisplásicas",
                        "Distúrbios mieloproliferativos",
                        "Hemostasia e distúrbios hemorrágicos: vasculares e plaquetários",
                        "Distúrbios da coagulação",
                        "Trombofilias",
                        "Mieloma e doenças relacionadas",
                        "Hemoterapia e doação de sangue",
                        "Transplante de medula óssea"
                    ],
                    "references": [
                        "HOFFMAN, R. et al. Hematology: Basic Principles and Practice. 8th ed. Elsevier, 2022.",
                        "GREER, J.P. et al. Wintrobe’s Clinical Hematology. 14th ed. Wolters Kluwer, 2018.",
                        "KAUSHANSKY, K. et al. Williams Hematology. 10th ed. McGraw Hill, 2021.",
                        "GOLDMAN, L.; COONEY, K.A. Goldman-Cecil Medicine. 27th ed. Elsevier, 2023.",
                        "LOSCALZO, J. et al. Harrison’s Principles of Internal Medicine. 21st ed. McGraw Hill, 2022."
                    ]
                }
            },
            {
                id: 'neurologia',
                title: 'Neurologia',
                duration: '3 Anos',
                hours: '8.640 horas',
                vagas: '05 vagas + Cadastro Reserva (CR*)',
                vagasShort: '05 vagas + CR*',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva • 20 questões de múltipla escolha • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/neurologia.webp',
                rgb: '62, 30, 114',
                rgbDark: '36, 16, 72',
                syllabus: {
                    "topics": [
                        "Conceitos básicos de neuroanatomia e neurofisiologia",
                        "Cefaleias",
                        "Doenças cerebrovasculares",
                        "Epilepsias",
                        "Demências",
                        "Dor",
                        "Neuropatias periféricas",
                        "Doenças degenerativas do sistema nervoso",
                        "Doenças infecciosas do sistema nervoso",
                        "Desordens dos movimentos",
                        "Doenças neuroimunológicas",
                        "Métodos diagnósticos em neurologia"
                    ],
                    "references": [
                        "LOUIS, E.D.; MAYER, S.A.; NOBLE, J.M. Merritt – Tratado de Neurologia. 14ª ed. Guanabara Koogan, 2023.",
                        "ROPPER, A.; SAMUELS, M.; KLEIN, J.; PRASAD, S. Adams and Victor’s Principles of Neurology. 12th ed. McGraw Hill Medical, 2023.",
                        "CONTINUUM: Lifelong Learning in Neurology. Minneapolis: American Academy of Neurology, 2024, 2025 e 2026."
                    ]
                }
            },
            {
                id: 'otorrinolaringologia',
                title: 'Otorrinolaringologia',
                duration: '3 Anos',
                hours: '8.040 horas',
                vagas: '01 vaga + Cadastro Reserva (CR*)',
                vagasShort: '01 vaga + CR*',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva e Discursiva • 50 questões • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/otorrinolaringologia.webp',
                rgb: '116, 68, 32',
                rgbDark: '72, 40, 18',
                syllabus: {
                    "topics": [
                        "Anatomia, fisiologia e semiologia das fossas nasais e cavidades paranasais; fisiopatologia de rinossinusite e epistaxes",
                        "Cabeça e pescoço e principais patologias das fossas nasais e cavidades paranasais",
                        "Fisiopatologia do anel linfático de Waldeyer e sua importância clínica",
                        "Critérios clínicos de indicação para adenoamigdalectomia e colocação de tubo de ventilação",
                        "Anatomia, fisiologia e métodos de exploração semiológica da laringe",
                        "Inflamações da laringe, paralisias laríngeas, tumores benignos e malignos da laringe",
                        "Semiologia e anatomia do aparelho auditivo; vias nervosas acústicas e vestibulares",
                        "Semiologia da função auditiva e aparelho vestibular",
                        "Principais patologias infecciosas da orelha externa, média e interna",
                        "Estomatologia clínica e principais patologias da cavidade oral e faringe"
                    ],
                    "references": [
                        "CHONE, C.T.; LIMA, W.T.A.; PIGNATARI, S.S.N. (Org.). Tratado de Otorrinolaringologia e Cirurgia de Cabeça e Pescoço. 4ª ed. Rio de Janeiro: GEN Guanabara Koogan, 2025. 2 v.",
                        "PILTCHER, O.B. et al. (Org.). Rotinas em Otorrinolaringologia. Porto Alegre: Artmed, 2015.",
                        "HUNGRIA, Hélio. Otorrinolaringologia. 8ª ed. Rio de Janeiro: Guanabara Koogan, 2000."
                    ]
                }
            },
            {
                id: 'pediatria',
                title: 'Pediatria',
                duration: '3 Anos',
                hours: '8.400 horas',
                vagas: '03 vagas + Cadastro Reserva (CR*)',
                vagasShort: '03 vagas + CR*',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva e Discursiva • 07 questões (05 múltipla escolha + 02 discursivas) • Nota mín. 6,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Semanal • Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/pediatria.webp',
                rgb: '42, 104, 115',
                rgbDark: '22, 64, 72',
                syllabus: {
                    "topics": [
                        "Crescimento e desenvolvimento da criança",
                        "Recém-nascido normal",
                        "Distúrbios respiratórios do recém-nascido",
                        "Icterícia",
                        "Vacinação",
                        "Anemias carenciais e hemolíticas",
                        "Diarreia aguda",
                        "Desidratação e terapia de reidratação; arboviroses (Zika, Chikungunya, Dengue)",
                        "SARS-CoV-2",
                        "Meningoencefalites",
                        "Pneumonias",
                        "Tuberculose",
                        "Asma",
                        "Infecção urinária",
                        "Doença reumática",
                        "Viroses comuns da infância",
                        "Sepse",
                        "Reanimação em pediatria",
                        "Desnutrição",
                        "Doenças infecto-parasitárias"
                    ],
                    "references": [
                        "DUTRA, Adauto. Medicina Neonatal. 2ª ed., 2016.",
                        "Programas do Ministério da Saúde: saúde da criança, crescimento e desenvolvimento, aleitamento materno, vacinação, doenças diarreicas, anemia, TRO, infecções respiratórias agudas, dengue e PCDT.",
                        "KLIEGMAN, R.M.; BEHRMAN, R.E.; JENSON, H.B. Nelson Tratado de Pediatria. 20ª ed. Rio de Janeiro: Elsevier, 2017.",
                        "CAMPOS JÚNIOR, D.; BURNS, D.A.; LOPEZ, F.A. Tratado de Pediatria da SBP. 5ª ed. São Paulo: Manole, 2022."
                    ]
                }
            },
            {
                id: 'pneumologia',
                title: 'Pneumologia',
                duration: '2 Anos',
                hours: '5.760 horas',
                vagas: '06 vagas AC + 02 Estrangeiros',
                vagasShort: '08 vagas (6 AC + 2 Ext)',
                inicio: '06/04/2027',
                prereq: 'Residência Médica ou especialização em Clínica Médica por no mínimo dois anos.',
                stage1: 'Prova Objetiva • 15 questões de múltipla escolha • Nota mín. 6,0',
                stage2: 'Etapa única (sem análise curricular e sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Semanal • Presencial seg a sex (08h às 18h) e sábado (08h às 12h)',
                image: 'assets/img/especialidades/pneumologia.webp',
                rgb: '14, 86, 108',
                rgbDark: '8, 50, 66',
                syllabus: {
                    "topics": [
                        "Avaliação funcional pulmonar básica",
                        "Bronquiectasias",
                        "Câncer de pulmão (básico)",
                        "Doença pulmonar obstrutiva crônica (DPOC)",
                        "Doenças pleurais",
                        "Pneumonias não hospitalares",
                        "Interpretação de exames de imagem torácica (básico)",
                        "Sinais e sintomas em Pneumologia",
                        "Tabagismo",
                        "Tuberculose"
                    ],
                    "references": [
                        "GINA – Global Initiative for Asthma: Global Strategy for Asthma Management and Prevention, 2026.",
                        "GOLD – Global Initiative for the Management of COPD. Update 2026.",
                        "SILVA, D.R. et al. Consenso sobre o diagnóstico da tuberculose da SBPT. J Bras Pneumol, 2021; 47(2).",
                        "REICHERT, J. et al. SBPT Smoking Cessation Guidelines. J Bras Pneumol, 2008; 34(10):845–80.",
                        "CORRÊA, R.A. et al. Recommendations for the management of community-acquired pneumonia. J Bras Pneumol, 2018; 44(5):405–23.",
                        "TEIXEIRA, L.R.; MILINAVICIUS, R.; SALES, R.K.B. Doenças Pleurais (Série Atualização e Reciclagem em Pneumologia), 2018.",
                        "PEREIRA, L.F.F. et al. Lung cancer screening in Brazil (SBCT/SBPT/CBR). J Bras Pneumol, 2024; 50(1):e20230233.",
                        "PEREIRA, M.C. et al. Consenso brasileiro sobre bronquiectasias não fibrocísticas. J Bras Pneumol, 2019; 45(4):e2019012."
                    ]
                }
            },
            {
                id: 'psiquiatria',
                title: 'Psiquiatria',
                duration: '3 Anos',
                hours: '8.877 horas',
                vagas: '03 vagas + Cadastro Reserva (CR*)',
                vagasShort: '03 vagas + CR*',
                inicio: '05/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Objetiva e Discursiva • 10 questões (08 objetivas + 02 discursivas / casos clínicos) • Nota mín. 6,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Obrigatória na matrícula para diploma obtido no exterior (Item 1.4).',
                schedule: 'Presencial seg a sex (08h às 17h)',
                image: 'assets/img/especialidades/psiquiatria.webp',
                rgb: '82, 92, 54',
                rgbDark: '48, 56, 30',
                syllabus: {
                    "topics": [
                        "Psicopatologia geral e semiologia psiquiátrica",
                        "Classificação em psiquiatria",
                        "Transtornos do espectro da esquizofrenia e outros transtornos psicóticos",
                        "Transtornos do humor",
                        "Transtornos de ansiedade",
                        "Transtorno obsessivo-compulsivo",
                        "Transtornos relacionados ao trauma e outros estressores",
                        "Transtornos dissociativos",
                        "Medicina psicossomática",
                        "Transtornos alimentares",
                        "Transtornos do sono",
                        "Transtornos disruptivos, de controle dos impulsos e de conduta",
                        "Transtornos aditivos e por uso de substância",
                        "Transtornos neurocognitivos",
                        "Transtornos de personalidade",
                        "Emergências psiquiátricas",
                        "Psicoterapias",
                        "Psicofarmacoterapias",
                        "Métodos de estimulação cerebral"
                    ],
                    "references": [
                        "FONTENELLE, L.F.; MENDLOWICZ, M.V. Manual de Psicopatologia Descritiva e Semiologia Psiquiátrica. Rio de Janeiro: Revinter, 2017.",
                        "KAPLAN, H.I.; SADOCK, B.J. Compêndio de Psiquiatria. 11ª ed. Artmed, 2017.",
                        "STAHL, S. Psicofarmacologia – Bases Neurocientíficas e Aplicações Práticas. 4ª ed. Guanabara Koogan, 2014."
                    ]
                }
            },
            {
                id: 'radiologia',
                title: 'Radiologia',
                duration: '3 Anos',
                hours: '4.815 horas',
                vagas: '02 vagas',
                vagasShort: '02 vagas',
                inicio: '08/03/2027',
                prereq: 'Graduação em Medicina.',
                stage1: 'Prova Discursiva • 20 questões práticas com projeção de imagens (10h às 11h) • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Presencial seg a sex (07h30 às 18h)',
                image: 'assets/img/especialidades/radiologia.webp',
                rgb: '18, 68, 122',
                rgbDark: '10, 40, 78',
                syllabus: {
                    "topics": [
                        "Fundamentos da Radiologia e Diagnóstico por Imagem",
                        "Radiologia do Aparelho Respiratório",
                        "Radiologia do Abdome",
                        "Radiologia Geral Aplicada",
                        "Interpretação Radiológica Sistematizada",
                        "Prática Clínica em Radiologia",
                        "Ética, Segurança e Responsabilidade Profissional"
                    ],
                    "references": [
                        "SANTOS, A.A.S.M.D.; NACIF, M.S.; GALVÃO, M.C. (Org.). Radiologia e Diagnóstico por Imagem – Abdome. 1ª ed. Rio de Janeiro: Rubio, 2005.",
                        "SANTOS, A.A.S.M.D.; NACIF, M.S.; MARCHIORI, E.S.; OLIVEIRA, M.E. (Org.). Radiologia e Diagnóstico por Imagem – Aparelho Respiratório. 1ª ed. Rio de Janeiro: Rubio, 2004.",
                        "NACIF, M.S.; MELLO, R.A.F. Bizu Comentado de Radiologia e Diagnóstico por Imagem. 1ª ed. Rio de Janeiro: Rubio, 2007.",
                        "NACIF, M.S.; FREITAS, L.O. Radiologia Prática para o Estudante de Medicina (Vols. I e II). Rio de Janeiro: Revinter, 2001–2003.",
                        "KOCH, H.A.; TONOMURA, E.T.; RIBEIRO, E.C.O.; SANTOS, A.A.S.M.D. A Radiologia na Formação do Médico. Nova ed. Rio de Janeiro: Revinter, 2011.",
                        "MARCHIORI, E.; SANTOS, M.L. Introdução à Radiologia. Rio de Janeiro: Guanabara Koogan, 2009.",
                        "PAUL & JUHL. Interpretação Radiológica. 6ª ed. Guanabara Koogan.",
                        "SUTTON, D. Textbook of Radiology and Imaging (Vols. I e II). 6th ed. Churchill Livingstone, 1998."
                    ]
                }
            },
            {
                id: 'radiologia-toracica',
                title: 'Radiologia e Diagnóstico por Imagem do Tórax',
                fullTitle: 'Radiologia e Diagnóstico por Imagem do Tórax',
                duration: '1 Ano e 6 Meses',
                hours: '1.864 horas',
                vagas: '02 vagas',
                vagasShort: '02 vagas',
                inicio: '08/03/2027',
                prereq: 'Residência ou pós-graduação concluída em Radiologia em programa credenciado pelo Colégio Brasileiro de Radiologia.',
                stage1: 'Prova Discursiva • 20 questões práticas com projeção de imagens (10h às 11h) • Nota mín. 7,0 (Peso 2)',
                stage2: 'Análise Curricular (Peso 1 • sem entrevista)',
                minAlunos: '1 aluno matriculado (Item 1.3)',
                revalidacao: 'Não listado entre os cursos com exigência de revalidação no Item 1.4 na matrícula.',
                schedule: 'Presencial seg a sex (07h30 às 18h)',
                image: 'assets/img/especialidades/radiologia-toracica.webp',
                rgb: '28, 56, 98',
                rgbDark: '16, 34, 62',
                syllabus: {
                    "topics": [
                        "Doenças Pulmonares Difusas: pneumonias intersticiais (fibrose pulmonar, UIP), sarcoidose, pneumoconioses",
                        "Nódulos e Massas Pulmonares: caracterização, estadiamento (incluindo linfonodos mediastinais) e seguimento",
                        "Neoplasias: câncer de pulmão (diagnóstico e estadiamento), mesotelioma, tumores mediastinais (tímicos, neurogênicos, germinativos)",
                        "Doenças Pleurais: derrame pleural, pneumotórax, espessamento pleural",
                        "Doenças Vasculares Torácicas: embolia pulmonar, aneurismas, dissecções da aorta",
                        "Emergências Torácicas: trauma torácico, abdome agudo com repercussão torácica",
                        "Doenças Infecciosas: tuberculose, pneumonias (incluindo atípicas), infecções fúngicas"
                    ],
                    "references": [
                        "BARONI, R.H. Coleção CBR Radiologia: Volume Tórax. 1ª ed. São Paulo: Editora dos Editores, 2024.",
                        "WEBB; MÜLLER; NAIDICH. High-Resolution CT of the Lung. 6th ed. Philadelphia, 2021.",
                        "ROCHITTE, Carlos. Atlas de Multimodalidade em Imagem Cardiovascular. 1ª ed. São Paulo: Editora dos Editores, 2022."
                    ]
                }
            }
        ];

        // -------------------------------------------------------------
