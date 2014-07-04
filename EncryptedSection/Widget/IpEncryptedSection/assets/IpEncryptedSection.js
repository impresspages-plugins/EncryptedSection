/**
 * @package ImpressPages
 *
 */
var IpWidget_IpEncryptedSection;

(function(){
    "use strict";

    /**
     * Javascript controller for my encrypted section widget
     */
    IpWidget_IpEncryptedSection = function() {
        this.widgetObject = null;
        this.data         = null;
        this.password     = null; // password is only kept in memory of this instance, to make editing easier

        /**
         * Initialize an encrypted section for editing in <b>admin mode</b>.
         * (This will not be called when the section is only shown.)
         * Initially the section is always locked.
         */
        this.init = function($widgetObject, data) {
            console.log("EncryptedSection.init(this.password='"+this.password+"', data='"+data+"', encryptedText='"+data.encryptedText+"')");
            this.widgetObject = $widgetObject;
            this.password = null;
            data.isLocked = true;
            this.data     = data;
            //$widgetObject.css("background-color", "#CFC");
            $widgetObject.find("#unlockSymbol").click(
                $.proxy(this.unlockSection, this)
            );
        };
        
        /**
         * When an EncryptedSection is added for the first time, 
         * then ask for a password.
         */
        this.onAdd = function () {
            console.log("EncryptedSection.onAdd()");
            this.password     = null;
            this.isLocked     = true;
            //this.data.encryptedText = "";
            //this.askForInitialPassword();   //TOOD: make it configurable via admin settings, wheter to ask for password on add
        };



        /**
         * Initially every encrypted section is locked. The user can unlock a section via the options menu.
         * If the section is still empty, e.g. newly added, the user will be asked to set a password.
         * If the section already contains encrypted content, the user will be asked for the password to decrypt.
         * If the password is already stored in this session, then the section will be decrypted immidiately.
         */
        this.unlockSection = function() {
            console.log("unlockSection(this.data.encryptedText='"+this.data.encryptedText+"')");
            if (this.password) {
                console.log("  already have password");
                try{
                    var plainText = decrypt(this.data.encryptedText, this.password);
                    this.isLocked = false;
                    this.widgetObject.find('.ipsContent').html(plainText);
                    this.initTinyMCE();
                } catch (e) {
                    console.log("ERROR: wrong password: "+e.message);
                }
            } else {
                if (this.data.encryptedText) {
                    this.askForPassword();         // ask for password for client side decryption
                } else {
                    this.askForInitialPassword();  // set initial password => will delete content (if there was any)
                }
                // The calls above do not block! 
            }
         };   
         
         /*
          * Prepare a fully featured TinyMCE and decrypt the section's content.
          * Precondition: this.password must be set!
          */
        this.initTinyMCE = function() {
            if (!this.password) {
                console.log("ERROR: cannot edit. Password is not set.");
                return;
            }     
             
            // prepare a fully featured TinyMce
            var customTinyMceConfig      = ipTinyMceConfig();
            customTinyMceConfig.plugins  = customTinyMceConfig.plugins + " advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table contextmenu paste textcolor";
            customTinyMceConfig.menubar  = true;
            customTinyMceConfig.toolbar  = "insertfile undo redo | styleselect forecolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image";
            customTinyMceConfig.toolbar1 = null;
            customTinyMceConfig.toolbar2 = null;

            // when content changes, encrypt it on the client, ie. in the browser, and autosave it to our impresspages backend
            var widgetObject = this.widgetObject;
            var password     = this.password;
            customTinyMceConfig.setup = function(ed, l) { ed.on('change', $.proxy( function(e) {
                var newPlaintText = widgetObject.find('.ipsContent').html();
                var encryptedData = encrypt(newPlaintText, password);
                console.log('EncryptedSection.onChange(): encryptedData='+encryptedData);
                //var decryptedText = decrypt(newEncryptedText, password);
                //console.log("decrypted test="+decryptedText);
                
                // Only send the encrypted data to the server! And we do not reload the widget, so that the user can keep editing.
                widgetObject.save({encryptedData: encryptedData});  
            }), this)};
            
            this.widgetObject.find('.ipsContent').tinymce(customTinyMceConfig);
        };

        /**
         * encrypt the given plaintext with AES.
         * @see https://github.com/digitalbazaar/forge#cipher
         * @param plainText the html contained in the widget
         * @param password the password to encrypt with
         * @return an array with the AES data:
         *         {
         *            salt: salt,                    // the salt used for the PKCS5.PBKDF2() function
         *            numIterations: numIterations,  // num iterations for that function
         *            iv:  iv,                       // the AES initial vector passed to cipher.start()
         *            encryptedHex: encryptedHex     // the encryptedText in HEX representation
         *         }
         * 
         */
        var encrypt = function(plainText, password) {
            if (!password) {
                throw "ERROR: EncryptedSection: No password given for encryption.";
            }
            if (!plainText) {
                return "";
            }
            
            // generate a random initial vector (IV)
            var forge = window.forge;
            var iv = forge.random.getBytesSync(16);
            
            // generate a password-based 16-byte key with PBDKF2 
            // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
            var salt = forge.random.getBytesSync(128);
            var numIterations = 10; //TODO: ftp://ftp.rsasecurity.com/pub/pkcs/pkcs-5v2/pkcs5v2-0.pdf   suggests 1000 iterations (page 7)
            var key = forge.pkcs5.pbkdf2(password, salt, numIterations, 16);
            
            // encrypt plainText using CBC mode    (other possible modes include: CFB, OFB, CTR, and GCM)
            var cipher = forge.cipher.createCipher('AES-CBC', key);
            cipher.start({iv: iv});
            cipher.update(forge.util.createBuffer(plainText));
            cipher.finish();
            
            var encryptedResult = {
                salt: salt,
                numIterations: numIterations,
                iv:  iv,
                encryptedHex: cipher.output.getHex();
                //Remark: Never ever return the password in here!! :-)
            };
            
            console.log("EncryptedResult="+encryptedResult);
            
            return encryptedResult;            
        }

        /**
         * Decrypt the encryptedText with AES. Will throw exception when password is wrong.
         * @param encrypted the encrypted text in HEX together with salt, numIterations and iv as returned by {encrypt()}
         * @param password the password for decryption
         * @throws Exception if the password is wrong or empty!
         * @return the decrypted plaintext
         * @see https://github.com/digitalbazaar/forge#cipher
         */
        var decrypt = function(encryptedData, password) {
            if (!password) {
                throw "ERROR: empty password in decrypt()";
            }
            if (!encryptedHex) {
                console.log("INFO: Unlocking empty section. Will return empty plaintext.");
                return "";
            }
            
            
            // generate a password-based 16-byte key with PBDKF2 
            // The salt and numIterations must be the same as used when encrypting.
            var forge = window.forge; 
            var key = forge.pkcs5.pbkdf2(password, encryptedData.salt, encryptedData.numIterations, 16);

            // decrypt some bytes using CBC mode (w/no padding)
            // (other modes include: CFB, OFB, CTR, and GCM)
            var decipher = forge.cipher.createDecipher('AES-CBC', key);
            decipher.start({iv: encryptedData.iv});
            
            
            //TODO: FIXME: encryptedHex is in HEX, but somehow I need bytes :-(
            
            decipher.update(forge.util.createBuffer(encryptedHex));
            decipher.finish(function(){return true;});
            var plainText = decipher.output.getBytes();
            //TODO: log decrypted HTML 
            console.log("plainText="+plainText);

            return plainText;
        };
        
        /**
         * Ask user for an initial password of a <b>newly added</b> encrypted section.
         * The new password will be saved in the {this.password} instance variable.
         * Then the section's content will be cleared. (There should not have been any content anyway.)
         */
        this.askForInitialPassword = function() {
            var popup = $('#AskForInitialPasswordPopup');
            var confirmButton = popup.find('.ipsConfirm');
            var passwordInput = popup.find('#password');
            var passwordCheckInput = popup.find('#passwordCheck');
            
            // only enable confirm button if passwords match and contain at least one char
            passwordInput.val("");
            passwordCheckInput.val("");
            var evtData = {
                confirmButton: confirmButton, 
                pwd1: passwordInput, 
                pwd2: passwordCheckInput
            };
            passwordInput.keyup(evtData, checkPasswords);
            passwordCheckInput.keyup(evtData, checkPasswords);
            
            // set  this.password   on Confirm
            confirmButton.prop('disabled', true);
            confirmButton.off(); // ensure we will not bind second time
            confirmButton.on('click', $.proxy( function(){
                // check passwords again, just to make sure
                if (passwordInput.val() == passwordCheckInput.val() &&
                    passwordInput.val().length > 0) 
                { 
                    this.password = passwordInput.val();   
                    this.widgetObject.find('.ipsContent').html("");  //make encrypted section empty
                    popup.modal('hide');
                    this.initTinyMCE();
                }
            }, this));
            
            // open modal popup with bootstrap
            popup.modal({
                backdrop : "static"
                //keyboard : false    // allow close with ESC. Then no password will be set
            }); 
            passwordInput.focus();
        };
        
        /**
         * Check if two JQuery text input fields for passwords match and contain at least 1 char.
         * If they do, then enable a confirmButton. This function is called onKeyUp of both passwords fields.
         * If any paramter is undefined or has no "value", always return false;
         * @param pwd1 JQuery text input
         * @param pwd2 JQuery text input
         */
        var checkPasswords = function(evt) {
            try {
                if (evt.data.pwd1.val().length > 0 && evt.data.pwd1.val() == evt.data.pwd2.val()) {
                    evt.data.confirmButton.prop('disabled', false);
                    if (evt.which == 13) {                    // click "Confirm" button on return key
                        evt.data.confirmButton.trigger("click");  
                    }
                    return;
                }
            } catch(e) {
                // empty catch
            }
            evt.data.confirmButton.prop('disabled', true);
        };
        
        
        /**
         * Ask user for a password in a modal popup window.
         * This will be called on unlock and when there already is some encrypted content in the section.
         */
        this.askForPassword = function() {
            var popup = $('#AskForPasswordPopup');
            var confirmButton = popup.find('.ipsConfirm');
            var passwordInput = popup.find('#password');
            
            // only enable confirm button if password length > 1 char
            passwordInput.val("");
            passwordInput.on('keyup', function(evt){
                if (this.value && this.value.length > 0) {
                  confirmButton.prop('disabled', false);
                  if (evt.which == 13) {
                      confirmButton.trigger("click");  // click "Confirm" button on return
                  }
                } else {
                  confirmButton.prop('disabled', true);
                }
            });
            
            // set  this.password   on Confirm
            confirmButton.prop('disabled', true);
            confirmButton.off(); // ensure we will not bind second time
            confirmButton.on('click', $.proxy( function(){
                if (passwordInput.val() && passwordInput.val().length > 0) {
                    this.password = passwordInput.val();
                    var plainText = decrypt(this.data.encryptedText, this.password);
                    this.widgetObject.find('.ipsContent').html(plainText);
                    popup.modal('hide');
                    this.initTinyMCE();    
                }
            }, this));
            
            // open modal popup with bootstrap
            popup.modal({
                backdrop : "static"
                //keyboard : false
            }); 
            passwordInput.focus();
        };
        
    };

})();


