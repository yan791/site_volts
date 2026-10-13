import{A as e,B as t,E as n,G as r,H as i,I as a,K as o,L as s,M as c,N as l,O as u,P as d,R as f,T as p,U as m,V as h,W as g,a as _,b as ee,c as v,f as y,g as b,h as te,i as x,j as S,k as ne,l as re,m as ie,n as ae,o as C,p as w,q as T,r as E,s as D,t as oe,v as O,w as se,y as ce}from"./three.module-Bja2B71U.js";var k={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},A=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},j=new ne(-1,1,1,-1,0,1),le=new class extends _{constructor(){super(),this.setAttribute(`position`,new w([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new w([0,2,0,0,2,0],2))}},M=class{constructor(e){this._mesh=new p(le,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,j)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},ue=class extends A{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof h?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=g.clone(e.uniforms),this.material=new h({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new M(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},N=class extends A{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},de=class extends A{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},fe=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new r);this._width=n.width,this._height=n.height,t=new T(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:b}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ue(k),this.copyPass.material.blending=0,this.timer=new m}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}N!==void 0&&(r instanceof N?n=!0:r instanceof de&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new r);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},pe=class extends A{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new D}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},me={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new D(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},P=class e extends A{constructor(e,t=1,i,a){super(),this.strength=t,this.radius=i,this.threshold=a,this.resolution=e===void 0?new r(256,256):new r(e.x,e.y),this.clearColor=new D(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),c=Math.round(this.resolution.y/2);this.renderTargetBright=new T(s,c,{type:b,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new T(s,c,{type:b,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new T(s,c,{type:b,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),s=Math.round(s/2),c=Math.round(c/2)}let l=me;this.highPassUniforms=g.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new h({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];let u=[6,10,14,18,22];s=Math.round(this.resolution.x/2),c=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(u[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new r(1/s,1/c),s=Math.round(s/2),c=Math.round(c/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let d=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=d,this.bloomTintColors=[new o(1,1,1),new o(1,1,1),new o(1,1,1),new o(1,1,1),new o(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=g.clone(k.uniforms),this.blendMaterial=new h({uniforms:this.copyUniforms,vertexShader:k.vertexShader,fragmentShader:k.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new D,this._oldClearAlpha=1,this._basic=new n,this._fsQuad=new M(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,i),this.renderTargetsVertical[e].setSize(n,i),this.separableBlurMaterials[e].uniforms.invSize.value=new r(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let i=[],a=[];for(let n=1;n<e;n+=2){let r=t[n],o=n+1<e?t[n+1]:0,s=r+o;i.push((n*r+(n+1)*o)/s),a.push(s)}return new h({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new r(.5,.5)},direction:{value:new r(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:i},gaussianWeights:{value:a}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new h({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};P.BlurDirectionX=new r(1,0),P.BlurDirectionY=new r(0,1);var F={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},he=class extends A{constructor(){super(),this.isOutputPass=!0,this.uniforms=g.clone(F.uniforms),this.material=new a({name:F.name,uniforms:this.uniforms,vertexShader:F.vertexShader,fragmentShader:F.fragmentShader}),this._fsQuad=new M(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},v.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},I=3.2,L=4.2,ge=-17,R=[-.5,-3.1,-5.7,-8.3,-10.9,-13.5],z=[-1.35,1.35],_e=1.5,ve=.82,B=-12.6,V=(e,t=0,n=1)=>Math.min(n,Math.max(t,e)),H=(e,t,n)=>V((n-e)/(t-e)),U=e=>e*e*(3-2*e),W=[{p:0,pos:[0,1.62,5.4],alvo:[0,2.05,-6]},{p:.13,pos:[0,1.62,4.5],alvo:[0,2.05,-6]},{p:.31,pos:[.15,1.55,-.4],alvo:[.25,1.95,-9]},{p:.37,pos:[0,1.42,-1.5],alvo:[0,3.3,-4.9]},{p:.53,pos:[0,1.38,-2.4],alvo:[0,3.3,-6.1]},{p:.61,pos:[0,1.5,-4.4],alvo:[0,1.85,B]},{p:.75,pos:[0,1.6,-6.6],alvo:[0,1.82,B]},{p:1,pos:[0,1.62,-5.6],alvo:[0,1.8,B]}];function G(e,t){let n=e.length,r=[];for(let i=0;i<n-1;i++)r.push((t[i+1]-t[i])/(e[i+1]-e[i]));let i=Array(n).fill(0);for(let e=1;e<n-1;e++)i[e]=r[e-1]*r[e]<=0?0:(r[e-1]+r[e])/2;for(let e=0;e<n-1;e++){if(r[e]===0){i[e]=i[e+1]=0;continue}let t=i[e]/r[e],n=i[e+1]/r[e],a=t*t+n*n;if(a>9){let o=3/Math.sqrt(a);i[e]=o*t*r[e],i[e+1]=o*n*r[e]}}return r=>{if(r<=e[0])return t[0];if(r>=e[n-1])return t[n-1];let a=0;for(;r>e[a+1];)a++;let o=e[a+1]-e[a],s=(r-e[a])/o,c=s*s,l=c*s;return(2*l-3*c+1)*t[a]+(l-2*c+s)*o*i[a]+(-2*l+3*c)*t[a+1]+(l-c)*o*i[a+1]}}var K=W.map(e=>e.p),q={pos:[0,1,2].map(e=>G(K,W.map(t=>t.pos[e]))),alvo:[0,1,2].map(e=>G(K,W.map(t=>t.alvo[e])))},ye=[{col:0,fil:1},{col:1,fil:1},{col:0,fil:2},{col:1,fil:2}],J=[[0,0],[69,0],[100,92],[119,102],[85,106],[84,186]],Y=[[228,0],[309,0],[201,260],[121,260]],X=2.5/260;function Z([e,t]){return[(e-154.5)*X,1.75+(130-t)*X]}function Q(e){let t=new i;return e.forEach((e,n)=>{let[r,i]=Z(e);n===0?t.moveTo(r,i):t.lineTo(r,i)}),t.closePath(),t}function $(e,t){let n=!1;for(let r=0,i=t.length-1;r<t.length;i=r++){let[a,o]=t[r],[s,c]=t[i];o>e[1]!=c>e[1]&&e[0]<(s-a)*(e[1]-o)/(c-o)+a&&(n=!n)}return n}function be(){let e=document.createElement(`canvas`);e.width=e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#0b0f0c`,t.fillRect(0,0,512,512),t.strokeStyle=`rgba(0,0,0,0.9)`,t.lineWidth=6,t.strokeRect(0,0,512,512);for(let e=0;e<2600;e++)t.fillStyle=`rgba(255,255,255,${Math.random()*.025})`,t.fillRect(Math.random()*512,Math.random()*512,2,2);let n=new C(e);return n.wrapS=n.wrapT=s,n.repeat.set(8.4,24),n.colorSpace=f,n.anisotropy=8,n}function xe(){let e=document.createElement(`canvas`);e.width=2048,e.height=1024;let t=e.getContext(`2d`);t.clearRect(0,0,2048,1024),t.save();let n=.95;t.translate(560,250),t.scale(n,n),t.fillStyle=`#e4ee1a`,t.fill(new Path2D(`M0 0H69L100 92L119 102L85 106L84 186Z`)),t.fillStyle=`#e9ecdf`,t.fill(new Path2D(`M228 0H309L201 260H121Z`)),t.restore(),t.fillStyle=`#e4ee1a`,t.font=`900 250px "Archivo Variable", "Arial Black", sans-serif`,t.fontStretch=`extra-expanded`,t.fillText(`OLTS`,850,495);let r=new C(e);return r.colorSpace=f,r.anisotropy=8,r}var Se=`
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uTempo;
  uniform float uFlash;
  uniform float uVinheta;
  #include <tonemapping_pars_fragment>
  #include <colorspace_pars_fragment>
  varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTempo * 7.0) * 43758.5453); }
  void main(){
    vec2 d = (vUv - 0.5);
    float ab = 0.0016 + uFlash * 0.006;
    vec3 c;
    c.r = texture2D(tDiffuse, vUv + d * ab * 2.0).r;
    c.g = texture2D(tDiffuse, vUv).g;
    c.b = texture2D(tDiffuse, vUv - d * ab * 2.0).b;
    c += uFlash * vec3(0.55, 0.62, 0.35);
    float v = smoothstep(0.95, 0.25, length(d * vec2(1.0, 1.15)));
    c *= mix(1.0, v, 0.55 * uVinheta);
    c += (h(vUv * 900.0) - 0.5) * 0.035;
    gl_FragColor = vec4(c, 1.0);
    #ifdef NEUTRAL_TONE_MAPPING
      gl_FragColor.rgb = NeutralToneMapping(gl_FragColor.rgb);
    #endif
    #ifdef SRGB_TRANSFER
      gl_FragColor = sRGBTransferOETF(gl_FragColor);
    #endif
  }`,Ce=class{renderer;cena=new t;camera=new e(50,1,.05,60);composer;bloom;uFinal;barrasQ;barrasV;reflexoQ;reflexoV;feixes=[];uPart;marca;matRaio;matBarra;arcos=[];ultimoArco=0;luzes=[];luzMarca;matLetreiro;quadros=[];cor=new D;quente=new D(1,.82,.6);verde=new D(.12,1,.42);movel;mouse={x:0,y:0,sx:0,sy:0};alvoCam=new o;marcaCentro=new o(0,1.75,B);tam={w:1,h:1};teto=1;qualidade=1;media=0;contagem=0;ultimoQuadro=0;trocas=0;get resolucao(){return+(this.teto*this.qualidade).toFixed(2)}constructor(e,{movel:t}){this.movel=t,this.renderer=new oe({canvas:e,antialias:!1,powerPreference:`high-performance`,alpha:!1}),this.renderer.setClearColor(395527,1),this.renderer.toneMapping=7,this.renderer.toneMappingExposure=.95,this.renderer.outputColorSpace=f,this.cena.background=new D(395527),this.cena.fog=new ie(329734,.036),this.montarSala();let i=new E(1,1,1),a=new n({color:16777215,toneMapped:!1,fog:!0}),o=new n({color:16777215,toneMapped:!1,fog:!0,transparent:!0,opacity:.2,depthWrite:!1}),s=R.length*z.length*4;this.barrasQ=new O(i,a,s),this.barrasV=new O(i,a,s),this.reflexoQ=new O(i,o,s),this.reflexoV=new O(i,o,s),this.montarQuadros(),this.cena.add(this.barrasQ,this.barrasV,this.reflexoQ,this.reflexoV);let{pontos:l,u}=this.montarParticulas();this.uPart=u,this.cena.add(l);let d=this.montarMarca();this.marca=d.grupo,this.matRaio=d.matRaio,this.matBarra=d.matBarra,this.cena.add(this.marca);for(let e=0;e<4;e++){let e=new _;e.setAttribute(`position`,new x(new Float32Array(78),3));let t=new ce(e,new ee({color:new D(2.4,2.8,2.2),toneMapped:!1,transparent:!0,opacity:0}));t.frustumCulled=!1,this.arcos.push(t),this.cena.add(t)}let p=new c(`#46f08c`,7,10,1.6),m=new c(`#ffe2b8`,5,9,1.6),h=new c(`#46f08c`,5,10,1.6);this.luzes.push(p,m,h),this.cena.add(p,m,h),this.luzMarca=new c(`#e8f51c`,0,7,1.6),this.luzMarca.position.set(0,1.9,-11.2),this.cena.add(this.luzMarca),this.cena.add(new ae(`#1b2b21`,.9)),this.composer=new fe(this.renderer),this.composer.addPass(new pe(this.cena,this.camera)),this.bloom=new P(new r(512,512),.7,.16,.8),this.composer.addPass(this.bloom);let g=this.bloom.setSize.bind(this.bloom);this.bloom.setSize=()=>g(Math.round(this.tam.w*this.teto*.5),Math.round(this.tam.h*this.teto*.5));let v=new he;this.uFinal=v.uniforms,Object.assign(this.uFinal,{uTempo:{value:0},uFlash:{value:0},uVinheta:{value:1}}),v.material.fragmentShader=Se,v.material.needsUpdate=!0,this.composer.addPass(v),window.addEventListener(`pointermove`,this.aoMouse,{passive:!0}),this.marca.visible=!0,this.composer.render(),this.marca.visible=!1}aoMouse=e=>{e.pointerType===`mouse`&&(this.mouse.x=e.clientX/innerWidth*2-1,this.mouse.y=e.clientY/innerHeight*2-1)};montarSala(){let e=new p(new S(L*2,30),new u({map:be(),roughness:.42,metalness:.15,transparent:!0,opacity:.84}));e.rotation.x=-Math.PI/2,e.position.set(0,0,-6),this.cena.add(e);let t=new u({color:`#0b1c13`,roughness:.92});for(let e of[-1,1]){let n=new p(new S(30,3.4000000000000004),t);n.rotation.y=-e*Math.PI/2,n.position.set(e*L,I/2,-6),this.cena.add(n);let r=new p(new S(30,.12),new u({color:`#050806`,roughness:.8}));r.rotation.y=-e*Math.PI/2,r.position.set(e*4.19,.06,-6),this.cena.add(r)}let n=new p(new S(L*2,3.4000000000000004),new u({color:`#0c2117`,roughness:.92}));n.position.set(0,I/2,ge),this.cena.add(n);let r=xe();this.matLetreiro=new u({map:r,emissiveMap:r,emissive:new D(`#ffffff`),emissiveIntensity:.3,roughness:.9,transparent:!0});let i=new p(new S(L*2,3.4000000000000004),this.matLetreiro);i.position.set(0,I/2,-16.98),this.cena.add(i);let a=new p(new S(L*2,30),new u({color:`#030403`,roughness:1}));a.rotation.x=Math.PI/2,a.position.set(0,3.2800000000000002,-6),this.cena.add(a);let o=new re(.62,1.25,I,32,1,!0);o.translate(0,-3.2/2,0);for(let e of R)for(let t of z){let n=new h({transparent:!0,depthWrite:!1,blending:2,side:2,uniforms:{uForca:{value:0},uCor:{value:new D(`#7dffb5`)}},vertexShader:`varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform float uForca; uniform vec3 uCor; varying float vY; varying vec3 vN; varying vec3 vV;
            void main(){ float a = smoothstep(${(-3.2).toFixed(2)}, 0.0, vY); a *= a; float borda = pow(1.0 - abs(dot(vN, vV)), 1.6);
            gl_FragColor = vec4(uCor, a * (1.0 - borda) * 0.022 * uForca); }`}),r=new p(o,n);r.position.set(t,I,e),this.feixes.push(r),this.cena.add(r)}}montarQuadros(){let e=new se,t=new d,n=new o,r=new o,i=0;R.forEach((a,s)=>{z.forEach(c=>{this.quadros.push({centro:new o(c,3.18,a),potencia:0,atraso:s*.22+(c>0?.11:0)+Math.random()*.08});for(let[o,s,l,u]of[[_e,this.barrasQ,this.reflexoQ,.045],[ve,this.barrasV,this.reflexoV,.038]]){let d=o/2,f=[[c,a-d,o+u,u],[c,a+d,o+u,u],[c-d,a,u,o],[c+d,a,u,o]];for(let[a,o,c,d]of f)r.set(a,3.1700000000000004,o),n.set(c,u*.8,d),e.compose(r,t,n),s.setMatrixAt(i,e),r.y=-3.1700000000000004,e.compose(r,t,n),l.setMatrixAt(i,e),s.setColorAt(i,new D(0,0,0)),l.setColorAt(i,new D(0,0,0)),i++;i-=4}i+=4})});for(let e of[this.barrasQ,this.barrasV,this.reflexoQ,this.reflexoV])e.instanceMatrix.needsUpdate=!0,e.instanceColor.needsUpdate=!0}montarParticulas(){let e=this.movel?1500:2800,t=new Float32Array(e*3),n=new Float32Array(e*3),r=new Float32Array(e),i=new Float32Array(e),a=[-10,330],o=0;for(;o<e;){let e=[a[0]+Math.random()*(a[1]-a[0]),Math.random()*262],s=$(e,J),c=$(e,Y);if(!s&&!c)continue;let[l,u]=Z(e);n.set([l,u,B+(Math.random()-.5)*.24],o*3),t.set([(Math.random()-.5)*8,Math.random()*I,4-Math.random()*19],o*3),r[o]=Math.random()*.45,i[o]=+!!s,o++}let s=new _;s.setAttribute(`position`,new x(t,3)),s.setAttribute(`aFim`,new x(n,3)),s.setAttribute(`aAtraso`,new x(r,1)),s.setAttribute(`aTom`,new x(i,1));let c={uMontar:{value:0},uTempo:{value:0},uBrilho:{value:.6},uEscala:{value:1}},u=new h({transparent:!0,depthWrite:!1,blending:2,uniforms:c,vertexShader:`
        attribute vec3 aFim; attribute float aAtraso; attribute float aTom;
        uniform float uMontar; uniform float uTempo; uniform float uEscala;
        varying float vTom; varying float vK; varying float vPerto;
        void main(){
          float k = clamp((uMontar - aAtraso) / 0.55, 0.0, 1.0);
          k = k * k * (3.0 - 2.0 * k);
          vec3 flutua = position + vec3(sin(uTempo * 0.3 + position.z) * 0.18, sin(uTempo * 0.21 + position.x * 1.7) * 0.12, cos(uTempo * 0.25 + position.y) * 0.18);
          vec3 p = mix(flutua, aFim, k);
          // trajetória em arco: as partículas sobem antes de assentar no V
          p.y += sin(k * 3.14159) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // perto da câmera a partícula some em vez de virar uma bolha enorme (e cara de desenhar)
          gl_PointSize = min(uEscala * mix(15.0, 14.0, k) / -mv.z, 26.0 * uEscala);
          gl_Position = projectionMatrix * mv;
          vTom = aTom; vK = k; vPerto = smoothstep(0.35, 1.6, -mv.z);
        }`,fragmentShader:`
        uniform float uBrilho; varying float vTom; varying float vK; varying float vPerto;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 c = mix(vec3(0.85, 1.0, 0.9), mix(vec3(1.0, 1.0, 0.95), vec3(0.95, 1.0, 0.1), vTom), vK);
          gl_FragColor = vec4(c * (0.9 + vK * 1.3), a * uBrilho * mix(0.4, 1.0, vK) * vPerto);
        }`}),d=new l(s,u);return d.frustumCulled=!1,{pontos:d,u:c}}montarMarca(){let e=new te,t={depth:.16,bevelEnabled:!0,bevelThickness:.025,bevelSize:.02,bevelSegments:2},r=new n({color:new D(1.5,1.55,.12),toneMapped:!1,transparent:!0,opacity:0}),i=new u({color:`#d9ded6`,emissive:new D(`#eef2ea`),emissiveIntensity:.22,roughness:.35,metalness:.1,transparent:!0,opacity:0}),a=new p(new y(Q(J),t),r),o=new p(new y(Q(Y),t),i);return e.add(a,o),e.position.z=-12.68,{grupo:e,matRaio:r,matBarra:i}}resize(e,t,n){this.tam={w:e,h:t},this.teto=Math.min(n,this.movel?1.5:1.25),this.aplicarResolucao();let r=e/t;this.camera.aspect=r,this.camera.fov=r<.8?66:r<1.2?58:50,this.camera.updateProjectionMatrix()}aplicarResolucao(){let{w:e,h:t}=this.tam,n=Math.max(.5,this.teto*this.qualidade);this.renderer.setPixelRatio(n),this.renderer.setSize(e,t,!1),this.composer.setPixelRatio(n),this.composer.setSize(e,t),this.trocas++,this.uPart.uEscala.value=t*n*.0016*(this.movel?1.2:1)}medir(){let e=performance.now(),t=e-this.ultimoQuadro;this.ultimoQuadro=e,!(t<=0||t>120)&&(this.media=this.media?this.media*.92+t*.08:t,!(++this.contagem<30)&&(this.contagem=0,this.media>18.5&&this.qualidade>.56?(this.qualidade=Math.max(.56,this.qualidade*.75),this.aplicarResolucao()):this.media<11&&this.qualidade<1&&(this.qualidade=Math.min(1,this.qualidade/.75),this.aplicarResolucao())))}posicionarCamera(e,t){let[n,r,i]=q.pos.map(t=>t(e)),[a,o,s]=q.alvo.map(t=>t(e));this.mouse.sx+=(this.mouse.x-this.mouse.sx)*.035,this.mouse.sy+=(this.mouse.y-this.mouse.sy)*.035;let c=Math.sin(t*.5)*.018;this.camera.position.set(n+this.mouse.sx*.12,r-this.mouse.sy*.07+c,i),this.alvoCam.set(a+this.mouse.sx*.2,o-this.mouse.sy*.12,s),this.camera.lookAt(this.alvoCam),this.luzes[0].position.set(-1.8,2.7,i-2.5),this.luzes[1].position.set(1.6,2.8,i-4.5),this.luzes[2].position.set(0,2.6,i-8)}gerarArco(e,t,n,r){let i=e.geometry.getAttribute(`position`),a=i.count;for(let e=0;e<a;e++){let o=e/(a-1),s=Math.sin(o*Math.PI);i.setXYZ(e,t.x+(n.x-t.x)*o+(Math.random()-.5)*r*s,t.y+(n.y-t.y)*o+(Math.random()-.5)*r*s-s*.08,t.z+(n.z-t.z)*o+(Math.random()-.5)*r*s)}i.needsUpdate=!0}apply(e,t,n,r){this.posicionarCamera(e,t);let i=.72+.28*U(H(.6,.95,e));this.quadros.forEach((e,a)=>{let o=V((n*2.4-e.atraso)/.5),s=1;o>0&&o<1&&(s=o<.25?.9:o<.42?.12:o<.6?1:o<.72?.4:1),o===0&&(s=0);let c=.94+.06*Math.sin(t*13+a*2.1)*Math.sin(t*3.7+a),l=0;for(let e of r)e.i===a&&(l=e.k);e.potencia=s*c*i*(1+l*.55)});let a=0;this.quadros.forEach(e=>{for(let t=0;t<4;t++)this.cor.copy(this.quente).multiplyScalar(1.75*e.potencia),this.barrasQ.setColorAt(a,this.cor),this.reflexoQ.setColorAt(a,this.cor),this.cor.copy(this.verde).multiplyScalar(2.3*e.potencia),this.barrasV.setColorAt(a,this.cor),this.reflexoV.setColorAt(a,this.cor),a++});for(let e of[this.barrasQ,this.barrasV,this.reflexoQ,this.reflexoV])e.instanceColor.needsUpdate=!0;this.feixes.forEach((e,t)=>e.material.uniforms.uForca.value=this.quadros[t].potencia);let s=Math.max(1-Math.abs(n-.55)*3,0)*.8+H(.15,.2,e)*(1-H(.3,.34,e))+H(.7,.76,e)*(1-H(.86,.95,e))*.8;t-this.ultimoArco>.07&&(this.ultimoArco=t,this.arcos.forEach((t,n)=>{let r=s>.02&&Math.random()<.55;if(t.material.opacity=r?Math.min(s,1)*(.5+Math.random()*.5):0,r){if(e>.65){let e=this.marcaCentro.clone().add(new o((Math.random()-.5)*2.4,(Math.random()-.3)*1.6,.2)),n=this.quadros[8+Math.floor(Math.random()*4)];this.gerarArco(t,e,n.centro,.42)}else{let e=Math.floor(Math.random()*4),r=this.quadros[e*2+n%2].centro.clone(),i=this.quadros[(e+1)*2+(n+1)%2].centro.clone();r.x+=(Math.random()-.5)*1.2,i.x+=(Math.random()-.5)*1.2,this.gerarArco(t,r,i,.5)}}}));let c=H(.555,.735,e);this.uPart.uMontar.value=c*1.45,this.uPart.uTempo.value=t,this.uPart.uBrilho.value=.18+.5*U(H(.5,.6,e))-.62*U(H(.74,.8,e));let l=U(H(.7,.78,e)),u=.82+.1*Math.sin(t*4.2);this.matRaio.opacity=l,this.matRaio.color.setRGB(1.5*u,1.55*u,.12),this.matBarra.opacity=l,this.marca.visible=l>.001,this.marca.rotation.y=(1-l)*.35+Math.sin(t*.5)*.02,this.luzMarca.intensity=6*l*u,this.matLetreiro.opacity=1-.92*U(H(.6,.72,e)),this.bloom.strength=(this.movel?.62:.7)+.1*U(H(.7,.8,e));let d=Math.max(0,1-Math.abs(e-.765)/.02)*.55+Math.max(0,1-Math.abs(n-.62)/.05)*.18;this.uFinal.uFlash.value=d,this.uFinal.uTempo.value=t}render(){this.medir(),this.composer.render()}projetar(e,t,n){let r=e.clone().project(this.camera);return{x:(r.x*.5+.5)*t,y:(-r.y*.5+.5)*n,frente:r.z<1}}dispose(){window.removeEventListener(`pointermove`,this.aoMouse),this.cena.traverse(e=>{let t=e;t.geometry?.dispose?.();let n=t.material;Array.isArray(n)?n.forEach(e=>e.dispose()):n?.dispose?.()}),this.composer.dispose(),this.renderer.dispose()}};export{ye as QUADROS_PROGRAMAS,Ce as Salao3D};