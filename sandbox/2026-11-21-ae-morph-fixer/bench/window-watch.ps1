# window-watch.ps1 - what Windows really shows, read from outside After Effects. ScriptUI said a
# palette was closed while it was on screen; this reads Windows' own window list instead.
# Polls every 0.25 s for a window with the given title and prints each change of state
# (absent, hidden, visible) with a Unix time in ms, to line up with a script's own log.
#   powershell -File bench/window-watch.ps1 -title "ghost test" -seconds 40
param([string]$title = "ghost test", [int]$seconds = 40)
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public class WindowWatch {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  public static string State(string title) {
    string r = "absent";
    EnumWindows((h, l) => {
      var s = new StringBuilder(256); GetWindowText(h, s, 256);
      if (s.ToString() == title && r != "visible") r = IsWindowVisible(h) ? "visible" : "hidden";
      return true;
    }, IntPtr.Zero);
    return r;
  }
}
"@
$last = ""; $end = (Get-Date).AddSeconds($seconds)
while ((Get-Date) -lt $end) {
  $s = [WindowWatch]::State($title)
  if ($s -ne $last) { "{0} {1}" -f [DateTimeOffset]::Now.ToUnixTimeMilliseconds(), $s; $last = $s }
  Start-Sleep -Milliseconds 250
}
