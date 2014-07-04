<?php /* remember: Initially an ecrypted section is always locked. */ ?>
<div class="ipsContent encryptedBg">
      <div class="ip" style="text-align: center">
        <span id="unlockSymbol" class="fa fa-lock fa-3x encUnlockSmbol" title="<?php
          if (empty($encryptedText)) {
              echo "Click to set initial password";
          } else {
              echo "This section is encrypted! Click to unlock.";
          }
        ?>"></span>
      </div>
</div>
