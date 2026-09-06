/* ============================================================================
   BURKA — весь контент сайта.
   Правьте ТОЛЬКО этот файл, чтобы поменять меню, цены, фото, контакты и отзывы.
   Каждый текст задан на трёх языках: ru — русский, ar — арабский, en — английский.
   Валюта — саудийский риал (SAR).
   ========================================================================= */

window.BURKA_DATA = {

  /* ------------------------------------------------------------------ */
  /* ЗАСТАВКА при загрузке.                                              */
  /*   darkMs — тёмный экран перед началом анимации                      */
  /*   animMs — прорисовка звезды, букв и золотой черты                  */
  /*   fadeMs — растворение заставки поверх главного экрана              */
  /*   oncePerSession — если поставить true, заставка покажется только при    */
  /*     первом открытии вкладки: гость, вернувшийся дозаказать, не будет     */
  /*     ждать её снова. Сейчас выключено — заставка играет каждый раз.       */
  /* Поставьте enabled: false, чтобы отключить заставку совсем.          */
  /* ------------------------------------------------------------------ */
  preloader: { enabled: true, oncePerSession: false, darkMs: 260, animMs: 1650, fadeMs: 650 },

  /* ------------------------------------------------------------------ */
  /* КОНТАКТЫ. Номера пишутся в международном формате без «+» и пробелов  */
  /* ------------------------------------------------------------------ */
  contacts: {
    whatsapp:    '966548447935',   // основной номер для заказов (Саудовская Аравия)
    whatsappAlt: '79382038886',    // второй номер (Россия), показан в контактах
    telegram:    'https://t.me/burkaksa',
    instagram:   'https://www.instagram.com/burka.ksa',
    sourcePage:  'https://newhaj.com/burka-restaurant-in-makkah/',

    // Точный адрес заведения нам не передали — здесь заглушка.
    // Впишите улицу/район, и он появится в блоке «Контакты» и в карточке карты.
    address: {
      ru: 'Мекка, Саудовская Аравия',
      ar: 'مكة المكرمة، المملكة العربية السعودية',
      en: 'Makkah, Saudi Arabia'
    },

    // Часы работы. Проверьте и поправьте под реальный график.
    hours: {
      ru: 'Ежедневно 09:00 — 23:00',
      ar: 'يوميًا من 09:00 حتى 23:00',
      en: 'Daily 09:00 — 23:00'
    }
  },

  /* ------------------------------------------------------------------ */
  /* ДОСТАВКА                                                            */
  /* ------------------------------------------------------------------ */
  delivery: {
    fee: 20,          // стоимость доставки по Мекке, SAR
    freeFrom: null,   // напр. 300 — бесплатно от 300 SAR; null — выключено
    currency: { ru: 'SAR', ar: 'ر.س', en: 'SAR' },
    zones: [
      {
        icon: 'pin',
        price: 20,
        name: { ru: 'Мекка', ar: 'مكة المكرمة', en: 'Makkah' },
        note: {
          ru: 'Доставка в отель или апартаменты по всему городу',
          ar: 'التوصيل إلى الفندق أو الشقة في جميع أنحاء المدينة',
          en: 'Delivery to your hotel or apartment across the city'
        }
      },
      {
        icon: 'road',
        price: null,  // null → показываем «по договорённости»
        name: { ru: 'Джидда', ar: 'جدة', en: 'Jeddah' },
        note: {
          ru: 'Принимаем заказы с доставкой — условия обсуждаем в переписке',
          ar: 'نستقبل الطلبات مع التوصيل — يتم الاتفاق على التفاصيل في المحادثة',
          en: 'Orders accepted — terms agreed in chat'
        }
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* КАРТА. Координаты — центр Мекки (Заповедная мечеть).                */
  /* Поставьте свои lat/lng, когда появится точный адрес кухни.          */
  /* ------------------------------------------------------------------ */
  map: {
    lat: 21.4225,
    lng: 39.8262,
    zoom: 14,
    label: { ru: 'Мекка', ar: 'مكة المكرمة', en: 'Makkah' }
  },

  /* ------------------------------------------------------------------ */
  /* КАТЕГОРИИ МЕНЮ                                                      */
  /* ------------------------------------------------------------------ */
  categories: [
    { id: 'khinkal', title: { ru: 'Хинкал',              ar: 'خينكال',            en: 'Khinkal' } },
    { id: 'dough',   title: { ru: 'Курзе, чуду и манты', ar: 'كورزه وتشودو ومانتي', en: 'Kurze, Chudu & Manti' } },
    { id: 'hot',     title: { ru: 'Горячее и супы',      ar: 'أطباق ساخنة وشوربات', en: 'Hot dishes & soups' } },
    { id: 'drinks',  title: { ru: 'Салаты и напитки',    ar: 'سلطات ومشروبات',     en: 'Salads & drinks' } }
  ],

  /* ------------------------------------------------------------------ */
  /* МЕНЮ                                                                */
  /*   id       — номер позиции, как в их прайсе (не меняйте без нужды)  */
  /*   price    — цена в SAR                                             */
  /*   img      — файл в assets/img (null → красивая узорная заглушка)   */
  /*   preorder — true: блюдо готовят под заказ, кнопка «Предзаказ»       */
  /*   hit      — true: значок «Хит»                                     */
  /* ------------------------------------------------------------------ */
  menu: [
    /* ---------- Хинкал ---------- */
    {
      id: 5, cat: 'khinkal', price: 45, img: 'dish-khinkal-avar.jpg', hit: true,
      name: {
        ru: 'Классический аварский хинкал',
        ar: 'خينكال أفاري كلاسيكي',
        en: 'Classic Avar Khinkal'
      },
      desc: {
        ru: 'Пышные ромбики теста, отварное мясо, бульон и чесночный соус — главное блюдо дагестанского стола.',
        ar: 'قطع عجين طرية مع لحم مسلوق ومرق وصلصة الثوم — الطبق الرئيسي على المائدة الداغستانية.',
        en: 'Fluffy dough diamonds with boiled meat, broth and garlic sauce — the centrepiece of a Dagestani table.'
      }
    },
    {
      id: 10, cat: 'khinkal', price: 45, img: 'dish-khinkal-lak.jpg',
      name: { ru: 'Лакский хинкал', ar: 'خينكال لاكي', en: 'Lak Khinkal' },
      desc: {
        ru: 'Мелкие «ракушки» из теста, мясо и два соуса — ореховый и томатный. Подаём как на родине.',
        ar: 'قطع صغيرة من العجين مع اللحم وصلصتين: الجوز والطماطم. نقدمه كما في الوطن.',
        en: 'Small shell-shaped dough pieces with meat and two sauces — walnut and tomato.'
      }
    },
    {
      id: 4, cat: 'khinkal', price: 45, img: 'dish-khinkal-whole.jpg', preorder: true,
      name: {
        ru: 'Цельнозерновой аварский хинкал',
        ar: 'خينكال أفاري بالحبوب الكاملة',
        en: 'Whole Wheat Avar Khinkal'
      },
      desc: {
        ru: 'Тот же аварский хинкал, но на цельнозерновой муке — плотнее, ароматнее, сытнее.',
        ar: 'نفس الخينكال الأفاري لكن بدقيق الحبوب الكاملة — أكثف نكهة وأكثر إشباعًا.',
        en: 'The same Avar khinkal made with wholemeal flour — denser, nuttier, more filling.'
      }
    },
    {
      id: 3, cat: 'khinkal', price: 45, img: null, preorder: true,
      name: { ru: 'Аварский хинкал со шпинатом', ar: 'خينكال أفاري بالسبانخ', en: 'Avar Khinkal with Spinach' },
      desc: {
        ru: 'Зелёное тесто на шпинате — мягкий вкус и красивая подача.',
        ar: 'عجين أخضر بالسبانخ — طعم لطيف وتقديم جميل.',
        en: 'Spinach-green dough — a milder taste and a beautiful serving.'
      }
    },
    {
      id: 6, cat: 'khinkal', price: 20, img: null, preorder: true,
      name: { ru: 'Кукурузный хинкал с зеленью', ar: 'خينكال الذرة بالأعشاب', en: 'Corn Khinkal with Greens' },
      desc: {
        ru: 'Кукурузная мука и свежая зелень — лёгкий вариант хинкала.',
        ar: 'دقيق الذرة مع أعشاب طازجة — نسخة خفيفة من الخينكال.',
        en: 'Corn flour and fresh herbs — the light version of khinkal.'
      }
    },

    /* ---------- Курзе, чуду и манты ---------- */
    {
      id: 1, cat: 'dough', price: 25, img: 'dish-kurze-meat.jpg', hit: true,
      name: { ru: 'Курзе с мясом', ar: 'كورزه باللحم', en: 'Meat Kurze' },
      desc: {
        ru: 'Дагестанские пельмени с фирменным защипом «косичкой». Тонкое тесто, сочная мясная начинка.',
        ar: 'زلابية داغستانية بحافة مجدولة مميزة. عجين رقيق وحشوة لحم غنية.',
        en: 'Dagestani dumplings with the signature braided seam. Thin dough, juicy meat filling.'
      }
    },
    {
      id: 2, cat: 'dough', price: 30, img: 'dish-kurze-egg.jpg',
      name: { ru: 'Курзе с яйцом', ar: 'كورزه بالبيض', en: 'Egg Kurze' },
      desc: {
        ru: 'Нежная начинка из яйца с молоком и зеленью — тает во рту.',
        ar: 'حشوة رقيقة من البيض والحليب والأعشاب — تذوب في الفم.',
        en: 'A delicate filling of egg, milk and herbs that melts in the mouth.'
      }
    },
    {
      id: 7, cat: 'dough', price: 40, img: 'dish-chudu-layered.jpg', hit: true,
      name: { ru: 'Слоёное чуду с мясом', ar: 'تشودو مورّق باللحم', en: 'Layered Chudu with Meat' },
      desc: {
        ru: 'Хрустящие румяные слои и щедрая мясная начинка. Печём в день заказа.',
        ar: 'طبقات مقرمشة ذهبية وحشوة لحم سخية. نخبزه في يوم الطلب.',
        en: 'Crisp golden layers with a generous meat filling. Baked on the day of your order.'
      }
    },
    {
      id: 8, cat: 'dough', price: 30, img: 'dish-chudu-thin.jpg',
      name: { ru: 'Тонкое чуду с мясом', ar: 'تشودو رقيق باللحم', en: 'Thin Chudu with Meat' },
      desc: {
        ru: 'Тонкая лепёшка на сухой сковороде — как пекут в горах Дагестана.',
        ar: 'رقاقة رفيعة تُخبز على صاج جاف — كما تُخبز في جبال داغستان.',
        en: 'A thin flatbread baked on a dry pan — the way it is made in the Dagestani mountains.'
      }
    },
    {
      id: 9, cat: 'dough', price: 25, img: null,
      name: { ru: 'Тонкое чуду с тыквой', ar: 'تشودو رقيق بالقرع', en: 'Thin Chudu with Pumpkin' },
      desc: {
        ru: 'Сладковатая тыква с луком и специями в тонком тесте. Вегетарианское.',
        ar: 'قرع حلو المذاق مع البصل والبهارات في عجين رقيق. نباتي.',
        en: 'Sweet pumpkin with onion and spices in thin dough. Vegetarian.'
      }
    },
    {
      id: 14, cat: 'dough', price: 30, img: 'dish-manti.jpg',
      name: { ru: 'Манты', ar: 'مانتي', en: 'Manti' },
      desc: {
        ru: 'Крупные манты на пару с мясом и луком. Подаём горячими, со сметанным соусом.',
        ar: 'مانتي كبيرة مطهوة بالبخار مع اللحم والبصل. تُقدم ساخنة مع صلصة القشدة.',
        en: 'Large steamed dumplings with meat and onion, served hot with sour-cream sauce.'
      }
    },

    /* ---------- Горячее и супы ---------- */
    {
      id: 11, cat: 'hot', price: 30, img: 'dish-chicken-potato.jpg', hit: true,
      name: { ru: 'Курица запечённая с картошкой', ar: 'دجاج مشوي بالبطاطس', en: 'Roasted Chicken with Potatoes' },
      desc: {
        ru: 'Целая курица с картофелем и овощами из духовки. Отличный вариант на семью.',
        ar: 'دجاجة كاملة مع البطاطس والخضار من الفرن. خيار ممتاز للعائلة.',
        en: 'A whole chicken roasted with potatoes and vegetables — a great choice for a family.'
      }
    },
    {
      id: 13, cat: 'hot', price: 25, img: 'dish-soup.jpg',
      name: { ru: 'Дагестанский суп с фрикадельками', ar: 'شوربة داغستانية بكرات اللحم', en: 'Dagestani Meatball Soup' },
      desc: {
        ru: 'Прозрачный бульон, мясные фрикадельки, картофель и много зелени.',
        ar: 'مرق صافٍ مع كرات اللحم والبطاطس والكثير من الأعشاب.',
        en: 'Clear broth with meatballs, potatoes and plenty of fresh herbs.'
      }
    },
    {
      id: 15, cat: 'hot', price: 30, img: 'dish-golubcy.jpg',
      name: { ru: 'Голубцы', ar: 'ملفوف محشي', en: 'Stuffed Cabbage Rolls' },
      desc: {
        ru: 'Капустные листья с мясом и рисом, томлёные в томатном соусе.',
        ar: 'أوراق الملفوف محشوة باللحم والأرز، مطهوة على نار هادئة بصلصة الطماطم.',
        en: 'Cabbage leaves filled with meat and rice, slow-cooked in tomato sauce.'
      }
    },
    {
      id: 17, cat: 'hot', price: 25, img: null,
      name: { ru: 'Борщ', ar: 'بورش', en: 'Borscht' },
      desc: {
        ru: 'Наваристый борщ на мясном бульоне. Подаём со сметаной.',
        ar: 'شوربة الشمندر الغنية على مرق اللحم. تُقدم مع القشدة الحامضة.',
        en: 'Rich beetroot soup on meat broth, served with sour cream.'
      }
    },
    {
      id: 12, cat: 'hot', price: 25, img: null, preorder: true,
      name: { ru: 'Котлеты с булгуром', ar: 'كفتة مع البرغل', en: 'Cutlets with Bulgur' },
      desc: {
        ru: 'Домашние котлеты и рассыпчатый булгур на гарнир.',
        ar: 'كفتة منزلية مع البرغل كطبق جانبي.',
        en: 'Home-style cutlets with fluffy bulgur on the side.'
      }
    },
    {
      id: 16, cat: 'hot', price: 10, img: null, preorder: true,
      name: { ru: 'Люля-кебаб (1 шт.)', ar: 'لولا كباب (حبة)', en: 'Lula Kebab (1 pc)' },
      desc: {
        ru: 'Сочный люля из рубленого мяса на мангале. Цена за одну штуку.',
        ar: 'لولا كباب من اللحم المفروم على الفحم. السعر للحبة الواحدة.',
        en: 'Juicy minced-meat kebab from the grill. Price per piece.'
      }
    },

    /* ---------- Салаты и напитки ---------- */
    {
      id: 18, cat: 'drinks', price: 15, img: 'dish-salad.jpg',
      name: { ru: 'Салат из свежих овощей', ar: 'سلطة خضار طازجة', en: 'Fresh Vegetable Salad' },
      desc: {
        ru: 'Помидоры, огурцы, красный лук и зелень с растительным маслом.',
        ar: 'طماطم وخيار وبصل أحمر وأعشاب مع الزيت النباتي.',
        en: 'Tomatoes, cucumbers, red onion and herbs with vegetable oil.'
      }
    },
    {
      id: 19, cat: 'drinks', price: 25, img: 'dish-kompot.jpg',
      name: { ru: 'Домашний компот (1,5 л)', ar: 'كومبوت منزلي (1.5 لتر)', en: 'Homemade Compote (1.5 L)' },
      desc: {
        ru: 'Ягодный компот собственной варки. Бутылка 1,5 литра — на всю семью.',
        ar: 'مشروب التوت المطبوخ منزليًا. عبوة 1.5 لتر تكفي العائلة.',
        en: 'Home-brewed berry drink. A 1.5-litre bottle for the whole family.'
      }
    }
  ],

  /* ------------------------------------------------------------------ */
  /* ГАЛЕРЕЯ                                                             */
  /* ------------------------------------------------------------------ */
  gallery: [
    { img: 'gal-05.jpg', cap: { ru: 'Аварский хинкал',       ar: 'خينكال أفاري',        en: 'Avar khinkal' } },
    { img: 'gal-01.jpg', cap: { ru: 'Курзе ручной лепки',    ar: 'كورزه بصنع يدوي',     en: 'Hand-folded kurze' } },
    { img: 'gal-03.jpg', cap: { ru: 'Слоёное чуду',          ar: 'تشودو مورّق',         en: 'Layered chudu' } },
    { img: 'gal-02.jpg', cap: { ru: 'Курзе на шпинатном тесте', ar: 'كورزه بعجين السبانخ', en: 'Kurze with spinach dough' } },
    { img: 'gal-06.jpg', cap: { ru: 'Чуду на цельнозерновой муке', ar: 'تشودو بدقيق الحبوب الكاملة', en: 'Wholemeal chudu' } },
    { img: 'gal-04.jpg', cap: { ru: 'Стол на компанию',      ar: 'مائدة للمجموعة',      en: 'A table for a group' } },
    { img: 'gal-07.jpg', cap: { ru: 'Голубцы',               ar: 'ملفوف محشي',          en: 'Cabbage rolls' } },
    { img: 'gal-08.jpg', cap: { ru: 'Курзе с яйцом',         ar: 'كورزه بالبيض',        en: 'Egg kurze' } }
  ],

  /* ------------------------------------------------------------------ */
  /* ОТЗЫВЫ                                                              */
  /*                                                                     */
  /*   ВНИМАНИЕ: пока это ДЕМО-ТЕКСТЫ, а не настоящие отзывы гостей.     */
  /*   Гостям сайта об этом ничего не говорится, поэтому замените их     */
  /*   живыми отзывами (WhatsApp, Telegram, Instagram) до того, как      */
  /*   начнёте рекламировать сайт.                                       */
  /*   Пока reviewsAreDemo: true, напоминание об этом выводится в        */
  /*   консоль браузера — посетитель его не видит.                       */
  /* ------------------------------------------------------------------ */
  reviewsAreDemo: true,

  reviews: [
    {
      name: 'Ахмад',
      city: { ru: 'Казань', ar: 'قازان', en: 'Kazan' },
      rating: 5,
      text: {
        ru: 'Заказывали хинкал и чуду прямо в отель после умры. Привезли горячим, порции большие. Вкус как у бабушки.',
        ar: 'طلبنا الخينكال والتشودو إلى الفندق بعد العمرة. وصل ساخنًا والحصص كبيرة. الطعم مثل بيت الجدة.',
        en: 'We ordered khinkal and chudu straight to the hotel after umrah. Arrived hot, big portions. Tastes like home.'
      }
    },
    {
      name: 'Мадина',
      city: { ru: 'Махачкала', ar: 'مخاتشكالا', en: 'Makhachkala' },
      rating: 5,
      text: {
        ru: 'Курзе — один в один как дома. Приехали быстро, всё аккуратно упаковано. Берём второй раз.',
        ar: 'الكورزه تمامًا كما في البيت. وصل سريعًا وكل شيء معبأ بعناية. طلبناه للمرة الثانية.',
        en: 'The kurze is exactly like at home. Fast delivery, neatly packed. Our second order already.'
      }
    },
    {
      name: 'Ruslan',
      city: { ru: 'Джидда', ar: 'جدة', en: 'Jeddah' },
      rating: 5,
      text: {
        ru: 'Брали на группу из восьми человек, заказ приняли заранее. Всё привезли вовремя, никто не остался голодным.',
        ar: 'طلبنا لمجموعة من ثمانية أشخاص، وتم قبول الطلب مسبقًا. وصل كل شيء في الوقت المحدد.',
        en: 'Ordered for a group of eight, booked in advance. Everything arrived on time, nobody left hungry.'
      }
    },
    {
      name: 'Фатима',
      city: { ru: 'Уфа', ar: 'أوفا', en: 'Ufa' },
      rating: 5,
      text: {
        ru: 'Очень выручили: с детьми искать кафе тяжело. Написали в WhatsApp — через час еда была в номере.',
        ar: 'ساعدونا كثيرًا: البحث عن مطعم مع الأطفال صعب. راسلناهم على واتساب ووصل الطعام خلال ساعة.',
        en: 'A real lifesaver with kids — searching for a cafe is hard. We messaged on WhatsApp and food arrived within an hour.'
      }
    }
  ],

  /* ------------------------------------------------------------------ */
  /* ЧАСТЫЕ ВОПРОСЫ                                                      */
  /* ------------------------------------------------------------------ */
  faq: [
    {
      q: { ru: 'Как сделать заказ?', ar: 'كيف أطلب؟', en: 'How do I place an order?' },
      a: {
        ru: 'Соберите корзину на сайте и нажмите «Оформить». Заказ уйдёт готовым сообщением в WhatsApp — останется отправить и подтвердить время.',
        ar: 'أضف الأطباق إلى السلة واضغط «إتمام الطلب». سيتم تجهيز رسالة واتساب جاهزة — أرسلها وأكّد الوقت.',
        en: 'Fill the cart and press “Checkout”. A ready-made WhatsApp message opens — just send it and confirm the time.'
      }
    },
    {
      q: { ru: 'За сколько заказывать заранее?', ar: 'كم من الوقت مسبقًا يجب الطلب؟', en: 'How far in advance should I order?' },
      a: {
        ru: 'Домашнюю еду готовим под заказ. Если вы едете семьёй или группой — напишите заранее, так мы точно всё успеем.',
        ar: 'نطبخ الطعام المنزلي حسب الطلب. إذا كنتم عائلة أو مجموعة، راسلونا مسبقًا لنجهز كل شيء في وقته.',
        en: 'Home food is cooked to order. For a family or a group, message us in advance so everything is ready on time.'
      }
    },
    {
      q: { ru: 'Куда доставляете?', ar: 'إلى أين توصلون؟', en: 'Where do you deliver?' },
      a: {
        ru: 'По всей Мекке — в отель или апартаменты. Также принимаем заказы с доставкой в Джидду, условия обсуждаем в переписке.',
        ar: 'في جميع أنحاء مكة المكرمة — إلى الفندق أو الشقة. كما نستقبل طلبات التوصيل إلى جدة، ويتم الاتفاق على التفاصيل في المحادثة.',
        en: 'Across Makkah — to your hotel or apartment. We also take orders for delivery to Jeddah, terms agreed in chat.'
      }
    },
    {
      q: { ru: 'На каком языке можно писать?', ar: 'بأي لغة يمكنني المراسلة؟', en: 'What language can I write in?' },
      a: {
        ru: 'Пишите по-русски, по-арабски или по-английски — ответим на вашем языке.',
        ar: 'راسلنا بالروسية أو العربية أو الإنجليزية — سنرد بلغتك.',
        en: 'Write in Russian, Arabic or English — we will answer in your language.'
      }
    }
  ],

  /* ------------------------------------------------------------------ */
  /* ПРИЁМ ЗАЯВОК В TELEGRAM (необязательно).                            */
  /* Пока endpoint = null, заказ уходит только в WhatsApp.               */
  /* Запустите telegram/server.js и впишите сюда его адрес — тогда копия */
  /* заказа будет приходить ещё и ботом, даже если гость не нажал        */
  /* «Отправить» в WhatsApp.                                             */
  /* ------------------------------------------------------------------ */
  orderEndpoint: null   // напр. 'https://ваш-домен.ru/api/order'
};
