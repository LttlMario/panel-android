package ro.littlemario.panelmafie;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeWebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String DISCORD_HOST = "discord.com";
    private static final String DISCORD_ALT_HOST = "discordapp.com";
    private static final String PUBLIC_CALLBACK = "https://lttlmario.github.io/panel-pro/login.html";
    private static final String LOCAL_LOGIN = "https://panel.local/login.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = bridge.getWebView();
        webView.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(view, request.getUrl()) || super.shouldOverrideUrlLoading(view, request);
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(view, Uri.parse(url)) || super.shouldOverrideUrlLoading(view, url);
            }
        });
    }

    private boolean handleNavigation(WebView view, Uri uri) {
        if (uri == null) return false;

        String url = uri.toString();
        String host = uri.getHost();

        // Fluxul OAuth Discord rămâne în WebView; nu este trimis către browserul extern.
        if (DISCORD_HOST.equalsIgnoreCase(host) || DISCORD_ALT_HOST.equalsIgnoreCase(host)) {
            return false;
        }

        // Callback-ul public este adus înapoi pe origin-ul local, păstrând hash-ul OAuth
        // și sessionStorage-ul în care login.html a salvat state-ul.
        if (url.startsWith(PUBLIC_CALLBACK)) {
            view.loadUrl(LOCAL_LOGIN + url.substring(PUBLIC_CALLBACK.length()));
            return true;
        }

        return false;
    }
}
