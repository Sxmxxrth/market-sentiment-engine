import yfinance as yf
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

def get_stock_price(ticker: str):
    """
    Fetches the current price and basic info for a given ticker symbol.
    """
    stock = yf.Ticker(ticker)
    try:
        # get today's data
        todays_data = stock.history(period='1d')
        if todays_data.empty:
            return {"error": "Ticker not found or no data available"}
            
        current_price = todays_data['Close'].iloc[-1]
        
        info = stock.info
        name = info.get('longName', ticker)
        previous_close = info.get('previousClose', current_price)
        
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close else 0
        
        return {
            "ticker": ticker.upper(),
            "name": name,
            "current_price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2)
        }
    except Exception as e:
        return {"error": str(e)}


def get_news_headlines(ticker: str, limit: int = 5):
    """
    Fetches recent news headlines for a ticker using Google News RSS.
    We use RSS to avoid needing an API key for this open source template.
    """
    query = quote(ticker)
    url = f"https://news.google.com/rss/search?q={query}+stock&hl=en-US&gl=US&ceid=US:en"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.findAll('item')
        
        news_list = []
        for item in items[:limit]:
            title = item.title.text if item.title else ""
            link = item.link.text if item.link else ""
            pub_date = item.pubDate.text if item.pubDate else ""
            
            # Clean up title (usually ends with " - Source Name")
            clean_title = title.rsplit(" - ", 1)[0]
            
            news_list.append({
                "title": clean_title,
                "url": link,
                "published_at": pub_date
            })
            
        return news_list
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []
