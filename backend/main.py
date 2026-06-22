from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Import our custom services
from services.sentiment import analyze_sentiment
from services.market_data import get_stock_price, get_news_headlines

app = FastAPI(
    title="Real-Time Market Sentiment API",
    description="An API that fetches stock prices and runs sentiment analysis on recent news headlines.",
    version="1.0.0"
)

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SentimentResponse(BaseModel):
    ticker: str
    stock_data: dict
    news: List[dict]
    average_sentiment: float
    overall_sentiment_label: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Market Sentiment Engine API"}

@app.get("/api/sentiment/{ticker}", response_model=SentimentResponse)
def get_ticker_sentiment(ticker: str):
    # 1. Fetch stock data
    stock_info = get_stock_price(ticker)
    if "error" in stock_info:
        raise HTTPException(status_code=404, detail=f"Stock data not found for {ticker}")

    # 2. Fetch recent news
    headlines = get_news_headlines(ticker, limit=10)
    
    # 3. Analyze sentiment for each headline
    analyzed_news = []
    total_compound = 0.0
    
    for article in headlines:
        analysis = analyze_sentiment(article["title"])
        
        # Combine the article data with its sentiment
        article_with_sentiment = {
            **article,
            "sentiment_score": analysis["compound_score"],
            "sentiment_label": analysis["label"]
        }
        analyzed_news.append(article_with_sentiment)
        total_compound += analysis["compound_score"]
        
    # 4. Calculate aggregate sentiment
    if len(analyzed_news) > 0:
        avg_sentiment = total_compound / len(analyzed_news)
    else:
        avg_sentiment = 0.0
        
    if avg_sentiment >= 0.1:
        overall_label = "BULLISH"
    elif avg_sentiment <= -0.1:
        overall_label = "BEARISH"
    else:
        overall_label = "NEUTRAL"
        
    return {
        "ticker": ticker.upper(),
        "stock_data": stock_info,
        "news": analyzed_news,
        "average_sentiment": round(avg_sentiment, 3),
        "overall_sentiment_label": overall_label
    }
