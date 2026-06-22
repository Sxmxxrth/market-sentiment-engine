from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> dict:
    """
    Analyzes the sentiment of a given text and returns the compound score.
    Compound score ranges from -1 (most extreme negative) to +1 (most extreme positive).
    """
    scores = analyzer.polarity_scores(text)
    
    # Determine the label based on the compound score
    compound = scores['compound']
    if compound >= 0.05:
        label = "POSITIVE"
    elif compound <= -0.05:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"
        
    return {
        "text": text,
        "compound_score": compound,
        "label": label,
        "scores": scores
    }
