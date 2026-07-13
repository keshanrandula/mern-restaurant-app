
const SYSTEM_PROMPT = `
You are GourmetAI, the premier AI Culinary Concierge of "Gourmet Restaurant Systems" (a luxury hotel and dining resort).
Speak in a highly polite, warm, elegant, and helpful manner matching a 5-star hotel concierge.
Answer menu queries, reservation questions, check-in requirements, and coupon offers.

Our Signature Menu items:
1. Signature Seafood Platter ($34.50) - Freshly caught rock lobster, grilled jumbo prawns, tropical fruit, secret chili butter (Gluten-Free, Spicy Level: 1)
2. Traditional Crab Curry ($28.00) - Authentic Sri Lankan lagoon crabs, rich roasted spices, coconut milk, curry leaves (Gluten-Free, Spicy Level: 3)
3. Passion Fruit Orchid Martini ($14.00) - Passion fruit nectar, premium vodka, orchid essence (Vegetarian, Vegan, Gluten-Free)
4. Truffle Tagliatelle ($24.50) - Black truffle sauce, wild mushrooms, parmesan (Vegetarian)
5. Crispy Skin Salmon ($28.00) - Atlantic salmon, asparagus, saffron butter, baby potatoes (Gluten-Free)
6. Warm Chocolate Lava Cake ($11.50) - Decadent chocolate cake, molten center, vanilla bean gelato (Vegetarian)

Our Services & FAQ:
- Standard check-in time for suites: 2:00 PM.
- Table and Suite reservations: We recommend booking at least 2 weeks in advance due to seasonal demand.
- Promos/Coupons: WELCOME10 gives a discount.

Keep your answers relatively concise, helpful, and luxurious in tone. Do not make up menu items that are not listed here.
`;

// Helper to provide realistic replies if OpenRouter Key is missing
const getMockResponse = (message) => {
  const query = message.toLowerCase();
  
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return "Greetings! Welcome to Gourmet Restaurant Systems. I am GourmetAI, your personal culinary concierge. How may I assist you with our menu or booking inquiries today?";
  }
  
  if (query.includes('menu') || query.includes('food') || query.includes('dishes') || query.includes('eat') || query.includes('list')) {
    return "Here is our exquisite Signature Menu:\n\n" +
           "1. ✦ Signature Seafood Platter ($34.50) - Freshly caught rock lobster, grilled jumbo prawns, fruit, secret chili butter (Gluten-Free, Spicy: 1)\n" +
           "2. ✦ Traditional Crab Curry ($28.00) - lagoon crab, roasted spices, coconut milk, curry leaves (Gluten-Free, Spicy: 3)\n" +
           "3. ✦ Passion Fruit Orchid Martini ($14.00) - passion fruit nectar, vodka, orchid essence (Vegetarian, Vegan, Gluten-Free)\n" +
           "4. ✦ Truffle Tagliatelle ($24.50) - black truffle sauce, wild mushrooms, parmesan (Vegetarian)\n" +
           "5. ✦ Crispy Skin Salmon ($28.00) - Atlantic salmon, asparagus, saffron butter, baby potatoes (Gluten-Free)\n" +
           "6. ✦ Warm Chocolate Lava Cake ($11.50) - chocolate cake, molten center, vanilla gelato (Vegetarian)\n\n" +
           "Would you like me to recommend a drink pairing or explain the ingredients of a specific dish?";
  }
  
  if (query.includes('seafood') || query.includes('platter') || query.includes('lobster') || query.includes('prawn')) {
    return "Our Signature Seafood Platter is a true masterpiece! It features freshly caught rock lobster and grilled jumbo prawns served with a tropical fruit medley and our house-secret chili butter. It is gluten-free ($34.50). I highly recommend pairing it with our Passion Fruit Orchid Martini!";
  }
  
  if (query.includes('curry') || query.includes('crab') || query.includes('spicy')) {
    return "For a rich, aromatic experience, our Traditional Crab Curry is outstanding. It is slow-cooked with lagoon crabs, roasted spices, coconut milk, and curry leaves ($28.00). Please note it has a spicy level of 3 (hot) and is gluten-free.";
  }
  
  if (query.includes('martini') || query.includes('drink') || query.includes('cocktail') || query.includes('alcohol')) {
    return "Our Passion Fruit Orchid Martini is a vibrant fusion of local passion fruit nectar, premium vodka, and a touch of orchid essence ($14.00). It is vegetarian, vegan, and gluten-free. Perfect by the beach!";
  }
  
  if (query.includes('pasta') || query.includes('truffle') || query.includes('tagliatelle') || query.includes('vegetarian')) {
    return "For our vegetarian guests, we recommend the Truffle Tagliatelle ($24.50). It consists of handcrafted pasta in a creamy black truffle sauce, wild mushrooms, and shaved parmesan. Decadent and flavorful!";
  }
  
  if (query.includes('salmon') || query.includes('fish')) {
    return "Our Crispy Skin Salmon ($28.00) is pan-seared Atlantic salmon accompanied by fresh asparagus, saffron butter sauce, and herb-roasted baby potatoes. It is gluten-free and cooked to perfection.";
  }
  
  if (query.includes('dessert') || query.includes('sweet') || query.includes('cake') || query.includes('chocolate') || query.includes('lava')) {
    return "For a sweet finale, you must try our Warm Chocolate Lava Cake ($11.50). It features a decadent molten center and is served with house-made vanilla bean gelato. It is a favorite among our guests!";
  }

  if (query.includes('gluten') || query.includes('allergy') || query.includes('allergens')) {
    return "We take dietary requirements very seriously. Our gluten-free options include the Signature Seafood Platter, Traditional Crab Curry, Crispy Skin Salmon, and the Passion Fruit Orchid Martini. Please notify your waiter of any allergies before ordering.";
  }
  
  if (query.includes('check') || query.includes('time') || query.includes('arrive') || query.includes('hour')) {
    return "Our standard check-in time for suites and guest rooms is 2:00 PM. If you require early check-in or late check-out, please let us know so we can accommodate your request based on availability.";
  }

  if (query.includes('reserve') || query.includes('book') || query.includes('table') || query.includes('room') || query.includes('suite')) {
    return "To reserve a table or suite, you can use our online Reservation page. We highly recommend booking at least 2 weeks in advance due to seasonal demand.";
  }

  if (query.includes('coupon') || query.includes('promo') || query.includes('discount') || query.includes('offer')) {
    return "Certainly! You can apply the promo code 'WELCOME10' at checkout to receive a special introductory discount on your food order.";
  }
  
  return "Thank you for reaching out to Gourmet Restaurant Systems. I would be delighted to help you explore our signature menu, find table availability, recommend drink pairings, or explain check-in details. What would you like to explore?";
};

// @desc    Get AI chat response
// @route   POST /api/ai
// @access  Public
export const getAIChatCompletion = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.log('OpenRouter API Key not found. Running in local concierge mode.');
      const reply = getMockResponse(message);
      return res.json({ reply });
    }

    // Format chat completions messages for OpenRouter
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add history (up to last 10 messages to avoid token blow-out)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach(msg => {
        chatMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Add current message
    chatMessages.push({ role: 'user', content: message });

    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
    console.log(`Calling OpenRouter completions with model: ${model}...`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'MERN Luxury Restaurant App'
      },
      body: JSON.stringify({
        model,
        messages: chatMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);
      throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || getMockResponse(message);
    
    res.json({ reply });
  } catch (error) {
    console.error('AI Completion controller error:', error);
    // Graceful fallback to offline logic if API call fails
    const reply = getMockResponse(req.body.message);
    res.json({ reply });
  }
};
